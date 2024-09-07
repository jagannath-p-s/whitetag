import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '../../supabaseClient';

// Define the FieldWithSwitch component
const FieldWithSwitch = ({ name, label, placeholder, value, onChange, visibilityState, handleSwitchChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="py-3 px-4 border border-gray-300 rounded-lg w-full"
      />
    </div>
    <div className="flex items-center space-x-2 mt-6">
      <Switch
        id={`${name}_visibility`}
        checked={visibilityState[`${name}_visibility`]} // Use visibility state
        onCheckedChange={() => handleSwitchChange(name)}
      />
      <Label htmlFor={`${name}_visibility`}>Visible</Label>
    </div>
  </div>
);

const PetForm = React.memo(({ currentPet, handleInputChange, handleFileUpload, uploading, imagePreview, visibilityState, handleSwitchChange }) => {
  return (
    <>
      <Input
        name="pet_unique_username"
        placeholder="Unique Username"
        value={currentPet.pet_unique_username}
        onChange={handleInputChange}
        className="py-3 px-4 border border-gray-300 rounded-lg"
      />
      <Input
        name="pet_name"
        placeholder="Pet Name"
        value={currentPet.pet_name}
        onChange={handleInputChange}
        className="py-3 px-4 border border-gray-300 rounded-lg"
      />
      <Input
        name="mobile_number"
        placeholder="Mobile Number"
        value={currentPet.mobile_number}
        onChange={handleInputChange}
        className="py-3 px-4 border border-gray-300 rounded-lg"
      />
      <div>
        <Label htmlFor="pet_image">Pet Image</Label>
        <Input
          id="pet_image"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="py-3 px-4 border border-gray-300 rounded-lg"
        />
        {uploading && <p>Uploading...</p>}
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Pet preview"
            className="w-full h-40 object-cover mt-2"
          />
        )}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Description"
          value={currentPet.description}
          onChange={handleInputChange}
          className="py-3 px-4 border border-gray-300 rounded-lg"
        />
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            id="description_visibility"
            checked={visibilityState.description_visibility}
            onCheckedChange={() => handleSwitchChange('description')}
          />
          <Label htmlFor="description_visibility">Show Description</Label>
        </div>
      </div>
    </>
  );
});

const PetProfileManager = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [visibilityState, setVisibilityState] = useState({
    description_visibility: false,
    whatsapp_visibility: false,
    location_visibility: false,
    instagram_visibility: false,
    gallery_visibility: false,
    address_visibility: false,
  });

  const [currentPet, setCurrentPet] = useState({
    id: null,
    pet_unique_username: '',
    pet_name: '',
    mobile_number: '',
    pet_image_url: '',
    description: '',
    whatsapp: '',
    location: '',
    instagram: '',
    gallery: '',
    address: '',
  });

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        fetchPets();
      } else {
        setError('User not authenticated');
      }
    };

    checkUser();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pet_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Error fetching pets');
    } else {
      setPets(data || []);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPet((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `pet_images/${fileName}`;

    setUploading(true);

    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    setUploading(false);

    if (uploadError) {
      setError('Error uploading file');
    } else {
      const publicUrl = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)
        .data.publicUrl;
      setCurrentPet((prev) => ({ ...prev, pet_image_url: publicUrl }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const petData = {
      ...currentPet,
      ...visibilityState,
      user_id: user.id,
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('pet_profiles')
          .update(petData)
          .eq('id', currentPet.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pet_profiles').insert([petData]);
        if (error) throw error;
      }

      await fetchPets();
      resetForm();
    } catch (error) {
      setError('Error submitting pet profile');
    }
  };

  const handleEdit = (pet) => {
    setCurrentPet(pet);
    setIsEditing(true);
    setIsDialogOpen(true);
    setImagePreview(pet.pet_image_url);
    setVisibilityState({
      description_visibility: pet.description_visibility,
      whatsapp_visibility: pet.whatsapp_visibility,
      location_visibility: pet.location_visibility,
      instagram_visibility: pet.instagram_visibility,
      gallery_visibility: pet.gallery_visibility,
      address_visibility: pet.address_visibility,
    });
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('pet_profiles')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchPets();
    }
  };

  const resetForm = () => {
    setCurrentPet({
      id: null,
      pet_unique_username: '',
      pet_name: '',
      mobile_number: '',
      pet_image_url: '',
      description: '',
      whatsapp: '',
      location: '',
      instagram: '',
      gallery: '',
      address: '',
    });
    setVisibilityState({
      description_visibility: false,
      whatsapp_visibility: false,
      location_visibility: false,
      instagram_visibility: false,
      gallery_visibility: false,
      address_visibility: false,
    });
    setIsEditing(false);
    setIsDialogOpen(false);
    setImagePreview('');
    setError('');
  };

  const handleSwitchChange = useCallback(
    (name) => {
      setVisibilityState((prev) => ({
        ...prev,
        [`${name}_visibility`]: !prev[`${name}_visibility`],
      }));
    },
    [setVisibilityState]
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Your Pets</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <p>Loading pets...</p>
      ) : pets.length === 0 ? (
        <p>You don't have any pets yet. Add your first pet below!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader>
                <CardTitle>{pet.pet_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Petname : {pet.pet_unique_username}</p>
                {pet.pet_image_url && (
                  <img
                    src={pet.pet_image_url}
                    alt={pet.pet_name}
                    className="w-full h-40 object-cover mt-2"
                  />
                )}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="mr-2"
                    onClick={() => handleEdit(pet)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(pet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add New Pet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" onCloseAutoFocus={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 px-2 py-4 max-h-[60vh] overflow-y-auto">
            <PetForm
              currentPet={currentPet}
              handleInputChange={handleInputChange}
              handleFileUpload={handleFileUpload}
              uploading={uploading}
              imagePreview={imagePreview}
              visibilityState={visibilityState}
              handleSwitchChange={handleSwitchChange}
            />
            <FieldWithSwitch
              name="whatsapp"
              label="WhatsApp"
              placeholder="WhatsApp Number"
              value={currentPet.whatsapp}
              onChange={handleInputChange}
              visibilityState={visibilityState}
              handleSwitchChange={handleSwitchChange}
            />
            <FieldWithSwitch
              name="location"
              label="Location"
              placeholder="Pet's Location"
              value={currentPet.location}
              onChange={handleInputChange}
              visibilityState={visibilityState}
              handleSwitchChange={handleSwitchChange}
            />
            <FieldWithSwitch
              name="instagram"
              label="Instagram"
              placeholder="Instagram Handle"
              value={currentPet.instagram}
              onChange={handleInputChange}
              visibilityState={visibilityState}
              handleSwitchChange={handleSwitchChange}
            />
            <FieldWithSwitch
              name="gallery"
              label="Gallery"
              placeholder="Gallery Link"
              value={currentPet.gallery}
              onChange={handleInputChange}
              visibilityState={visibilityState}
              handleSwitchChange={handleSwitchChange}
            />
            <FieldWithSwitch
              name="address"
              label="Address"
              placeholder="Pet's Address"
              value={currentPet.address}
              onChange={handleInputChange}
              visibilityState={visibilityState}
              handleSwitchChange={handleSwitchChange}
            />
          </div>
          <div className="flex justify-end gap-2 sticky bottom-0 bg-white py-2 px-4">
            <Button variant="outline" onClick={resetForm}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? 'Update' : 'Add'} Pet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PetProfileManager;

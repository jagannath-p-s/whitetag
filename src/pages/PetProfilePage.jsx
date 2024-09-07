import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Instagram, WhatsApp, LocationOn, Photo, Phone, AccountCircle, Map } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { motion } from 'framer-motion';

const PetProfilePage = () => {
  const { petusername } = useParams();
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('pet_unique_username', petusername)
          .single();

        if (error || !data) {
          throw new Error('Pet not found');
        }

        setPetData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petusername]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSaveContact = () => {
    if (!petData) return;
    const vcfData = `BEGIN:VCARD
VERSION:3.0
FN:${petData.pet_name}
TEL;TYPE=CELL:${petData.mobile_number}
END:VCARD`;

    const blob = new Blob([vcfData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${petData.pet_name}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleShareLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const message = `Here's my current location: https://www.google.com/maps?q=${latitude},${longitude}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }, (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please try again.');
      });
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15, 
        duration: 0.6 
      } 
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-6 font-sans"
      style={{ backgroundImage: `url('https://img.freepik.com/free-vector/abstract-organic-pattern-design-background_1048-19286.jpg?size=338&ext=jpg&ga=GA1.1.2008272138.1725667200&semt=ais_hybrid')`, backgroundSize: 'cover' }}
    >
      {petData && (
        <motion.div
          className="w-full max-w-md bg-white shadow-lg rounded-3xl overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={animationVariants}
        >
          <div className="p-6">
            <motion.div 
              className="flex justify-center items-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {petData.pet_image_url ? (
                <img
                  src={petData.pet_image_url}
                  alt={petData.pet_name}
                  className="w-100  object-cover rounded-lg "
                />
              ) : (
                <AccountCircle className="text-gray-400" style={{ fontSize: '128px' }} />
              )}
            </motion.div>

            <motion.div
              className="text-center mb-4"
              variants={animationVariants}
            >
              <h1 className="text-2xl font-semibold">{petData.pet_name}</h1>
            </motion.div>

            <div className="flex justify-center space-x-4 mb-6">
              <motion.button
                onClick={handleSaveContact}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Contact
              </motion.button>
              <motion.button
                onClick={handleShareLocation}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Share Location
              </motion.button>
            </div>

            {petData.instagram_visibility && petData.instagram && (
              <motion.div
                className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-3 shadow-sm"
                variants={animationVariants}
              >
                <div className="flex items-center">
                  <div className="bg-purple-200 p-2 rounded-lg mr-3">
                    <Instagram className="text-purple-500" />
                  </div>
                  <span>{petData.instagram}</span>
                </div>
                <motion.button
                  onClick={() => window.open(`https://instagram.com/${petData.instagram}`, '_blank')}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg shadow hover:bg-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <OpenInNewIcon />
                </motion.button>
              </motion.div>
            )}

            {petData.whatsapp_visibility && petData.whatsapp && (
              <motion.div
                className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-3 shadow-sm"
                variants={animationVariants}
              >
                <div className="flex items-center">
                  <div className="bg-green-200 p-2 rounded-lg mr-3">
                    <WhatsApp className="text-green-500" />
                  </div>
                  <span>{petData.whatsapp}</span>
                </div>
                <motion.button
                  onClick={() => window.open(`https://wa.me/${petData.whatsapp}`, '_blank')}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg shadow hover:bg-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <OpenInNewIcon />
                </motion.button>
              </motion.div>
            )}

            {petData.whatsapp_visibility && petData.mobile_number && (
              <motion.div
                className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-3 shadow-sm"
                variants={animationVariants}
              >
                <div className="flex items-center">
                  <div className="bg-blue-200 p-2 rounded-lg mr-3">
                    <Phone className="text-blue-500" />
                  </div>
                  <span>{petData.mobile_number}</span>
                </div>
                <motion.button
                  onClick={() => window.open(`tel:${petData.mobile_number}`, '_blank')}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg shadow hover:bg-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Phone />
                </motion.button>
              </motion.div>
            )}

            {petData.address_visibility && petData.address && (
              <motion.div
                className="mb-3"
                variants={animationVariants}
              >
                <motion.button
                  className="flex items-center justify-between w-full bg-gray-100 p-3 rounded-lg shadow hover:bg-gray-200"
                  onClick={() => setShowAddress(!showAddress)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-200 p-2 rounded-lg mr-3">
                      <LocationOn className="text-blue-500" />
                    </div>
                    <span>Address</span>
                  </div>
                </motion.button>
                {showAddress && (
                  <motion.div
                    className="mt-2 p-3 bg-gray-50 rounded-lg shadow-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {petData.address}
                    <div className="flex justify-end">
                      <motion.button
                        onClick={() => window.open(`https://www.google.com/maps/dir//${encodeURIComponent(petData.address)}`, '_blank')}
                        className="bg-gray-100 text-gray-600 p-2 mt-2 rounded-lg shadow hover:bg-gray-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Map />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          

            {petData.gallery_visibility && petData.gallery && (
              <motion.div
                className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-3 shadow-sm"
                variants={animationVariants}
              >
                <div className="flex items-center">
                  <div className="bg-blue-200 p-2 rounded-lg mr-3">
                    <Photo className="text-blue-500" />
                  </div>
                  <span>Photo Gallery</span>
                </div>
                <motion.button
                  onClick={() => window.open(petData.gallery, '_blank')}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg shadow hover:bg-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <OpenInNewIcon />
                </motion.button>
              </motion.div>
            )}
              {petData.description_visibility && petData.description && (
              <motion.div
                className="mb-3"
                variants={animationVariants}
              >
                <motion.button
                  className="flex items-center justify-between w-full bg-gray-100 p-3 rounded-lg shadow hover:bg-gray-200"
                  onClick={() => setShowDescription(!showDescription)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-200 p-2 rounded-lg mr-3">
                      <AccountCircle className="text-blue-500" />
                    </div>
                    <span>Description</span>
                  </div>
                </motion.button>
                {showDescription && (
                  <motion.div
                    className="mt-2 p-3 bg-gray-50 rounded-lg shadow-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {petData.description}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      <motion.footer
        className="mt-8 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        @{petusername} | powered by whitetap
      </motion.footer>
    </div>
  );
};

export default PetProfilePage;

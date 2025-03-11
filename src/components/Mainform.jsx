import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Mainform = () => {
  const [formData, setFormData] = useState({
    mc_mx_ff_number: '',
    legal_name: '',
    physical_address: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [storedData, setStoredData] = useState([]);
  const [entriesByDate, setEntriesByDate] = useState({
    totalEntries: 0,
    date: '',
  });
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://trucking-startup.onrender.com/api/form');
        setStoredData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const entriesResponse = await axios.post('https://trucking-startup.onrender.com/api/form/entries-by-date', {
          date: currentDate,
        });
        setEntriesByDate(entriesResponse.data);
  
        const totalEntriesResponse = await axios.get('https://trucking-startup.onrender.com/api/form/total-entries');
        setTotalEntries(totalEntriesResponse.data.totalEntries);
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };
  
    fetchAdditionalData(); // Initial Fetch
  
    // Fetch entries by date and total entries every 5 seconds
    const interval = setInterval(fetchAdditionalData, 5000);
  
    return () => clearInterval(interval); // Cleanup function
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.mc_mx_ff_number)
      newErrors.mc_mx_ff_number = 'MC/MX/FF Number is required';
    if (!formData.legal_name) newErrors.legal_name = 'Legal Name is required';
    if (!formData.physical_address)
      newErrors.physical_address = 'Physical Address is required';
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      newErrors.phone =
        'Phone number must be in international format (e.g., +13362467441)';
    }
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedPhone = formData.phone.replace(/[^\d+]/g, ''); // Normalize phone number
      const payload = {
        ...formData,
        phone: normalizedPhone,
      };

      console.log('Submitting form data:', payload); // Log the payload
      const response = await axios.post(
        'https://trucking-startup.onrender.com/api/form',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        setSubmitSuccess(true);
        setFormData({
          mc_mx_ff_number: '',
          legal_name: '',
          physical_address: '',
          phone: '',
        });
        const fetchResponse = await axios.get(
          'https://trucking-startup.onrender.com/api/form'
        );
        setStoredData(fetchResponse.data);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        setErrors({
          ...errors,
          submit:
            error.response.data.message ||
            'Failed to submit form. Please try again.',
        });
      } else {
        setErrors({
          ...errors,
          submit: 'Failed to submit form. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-gray-100'>
      <div className='bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl'>
        <h2 className='text-3xl font-bold mb-6 text-center text-blue-800'>
          Trucking Startup Form
        </h2>
        {submitSuccess && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>
            Form submitted successfully!
          </div>
        )}
        {errors.submit && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {errors.submit}
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-2'
              htmlFor='mc_mx_ff_number'
            >
              MC/MX/FF Number
            </label>
            <input
              type='text'
              id='mc_mx_ff_number'
              name='mc_mx_ff_number'
              value={formData.mc_mx_ff_number}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.mc_mx_ff_number ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
              placeholder='MC-1199876'
            />
            {errors.mc_mx_ff_number && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.mc_mx_ff_number}
              </p>
            )}
          </div>
          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-2'
              htmlFor='legal_name'
            >
              Legal Name
            </label>
            <input
              type='text'
              id='legal_name'
              name='legal_name'
              value={formData.legal_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.legal_name ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
              placeholder='BEDROCK GROUP LLC'
            />
            {errors.legal_name && (
              <p className='text-red-500 text-sm mt-1'>{errors.legal_name}</p>
            )}
          </div>
          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-2'
              htmlFor='physical_address'
            >
              Physical Address
            </label>
            <input
              type='text'
              id='physical_address'
              name='physical_address'
              value={formData.physical_address}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.physical_address ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
              placeholder='2902 QUEENSTOWN CIRCLE APT 2C, GREENSBORO, NC 27407'
            />
            {errors.physical_address && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.physical_address}
              </p>
            )}
          </div>
          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-2'
              htmlFor='phone'
            >
              Phone
            </label>
            <input
              type='text'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
              placeholder='+13362467441'
            />
            {errors.phone && (
              <p className='text-red-500 text-sm mt-1'>{errors.phone}</p>
            )}
          </div>
          <div className='flex w-full'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200'
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

   


        <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-white p-6 rounded-xl shadow-lg'>
            <h3 className='text-xl font-bold text-blue-800 mb-4'>
              {console.log('enter', entriesByDate)}
              Entries for {entriesByDate.date}
            </h3>
            <p className='text-gray-700'>
              Total Entries: {entriesByDate.totalEntries}
            </p>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-lg'>
            <h3 className='text-xl font-bold text-blue-800 mb-4'>
              Total Entries
            </h3>
            <p className='text-gray-700'>{totalEntries}</p>
          </div>
        </div>


        {/* <div className='mt-10'>
          <h3 className='text-2xl font-bold text-blue-800 mb-6'>Stored Data</h3>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-blue-600 text-white'>
                  <th className='p-3 text-left'>MC/MX/FF Number</th>
                  <th className='p-3 text-left'>Legal Name</th>
                  <th className='p-3 text-left'>Phone</th>
                </tr>
              </thead>
              <tbody>
                {storedData.map((item) => (
                  <tr
                    key={item._id}
                    className='border-b hover:bg-gray-50 transition duration-200'
                  >
                    <td className='p-3'>{item.mc_mx_ff_number}</td>
                    <td className='p-3'>{item.legal_name}</td>
                    <td className='p-3'>{item.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}

       
      </div>
    </div>
  );
};

export default Mainform;

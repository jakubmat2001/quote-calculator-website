import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../global-css/update-quote.css'
import Header from '../../components/Header/header';
import Footer from '../../components/Footer/footer';

function UpdateQuote() {
  const [quoteId, setQuoteId] = useState('');
  const [quote, setQuote] = useState(null);
  const [values, setValues] = useState({
    employeeName: '',
    workHours: '',
    workerType: '',
    humanResources: '',
  });

  useEffect(() => {
    const getAuth = sessionStorage.getItem("auth");
    const parsedAuthData = JSON.parse(getAuth);
    const empName = parsedAuthData.emp.name
    console.log(empName)
    setValues({ ...values, employeeName: empName })
  }, [])

  const navigate = useNavigate();

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleQuoteIdChange = (event) => {
    setQuoteId(event.target.value);
  };

  //we will first get the quote with a given quoteId 
  const fetchQuote = async () => {
    try {
      const token = JSON.parse(sessionStorage.getItem("auth")).token;

      const response = await axios.get(`http://127.0.0.1:8000/api/quotes/${quoteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setQuote(response.data);
      setValues({
        employeeName: response.data.employeeName,
        workHours: response.data.workHours,
        workerType: response.data.workerType,
        humanResources: response.data.humanResources,
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  //insert the new values into a database
  //if values retrived by fetchQuote weren't changed they'll stay the same
  const updateQuote = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(sessionStorage.getItem("auth")).token;

      await axios.put(`http://127.0.0.1:8000/api/quotes/${quoteId}`, values, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      navigate('/project-tab/project');
    } catch (error) {
      console.error('Error updating quote:', error.response ? error.response.data : error);
    }
  };

  return (
    <div className="container">
      <Header />
      <main className='standard-main'>
      <div className="update-quote-form-container">
        <h1 className="update-quote-h1">Update Project Quote</h1>
        <div className="quote-id-container">
          <label className="update-quote-label">
            Quote ID:
          </label>
          <input className="update-quote-input" type="text" value={quoteId} onChange={handleQuoteIdChange} />
          <button className="fetch-update-quote-button" type="button" onClick={fetchQuote}>
            Fetch Quote
          </button>
        </div>
        {quote && (
          <form className="form">
            <label className="update-quote-label">
              Employee Name:
              <input
                type="text"
                value={values.employeeName}
                disabled
              />
            </label>
            <br />
            <label className="update-quote-label">
              Work Hours:
              <input
                type="number"
                value={values.workHours}
                onChange={handleChange('workHours')}
              />
            </label>
            <br />
            <label className="update-quote-label">
              Worker Type:
              <select value={values.workerType} onChange={handleChange('workerType')}>
                <option value="junior">Junior</option>
                <option value="mid-senior">Mid-Senior</option>
                <option value="senior">Senior</option>
              </select>
            </label>
            <br />
            <label className="update-quote-label">
              Human Resources:
              <input
                placeholder='Enter Your Saved Quote Reference'
                type="number"
                value={values.humanResources}
                onChange={handleChange('humanResources')}
              />
            </label>
            <br />
            <div className='update-quote-button-container'>
              <button className="update-quote-button" type="submit" value="Submit" onClick={updateQuote}>
                Update Quote
              </button>
            </div>
          </form>
        )}
      </div>
      </main>
      <Footer />
    </div>
  );
}

export default UpdateQuote;

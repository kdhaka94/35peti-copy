import React, { useState, useEffect } from 'react';
import { whiteLabelService } from '../../../services/white-label.service';
import { useSelector } from 'react-redux';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import User from '../../../models/User';

const WhiteLabelConfig = () => {
  const userState = useSelector(selectUserData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    companyName: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    backgroundColor: '#ffffff',
    textColor: '#212529',
    fontFamily: 'Arial, sans-serif',
    customCSS: '',
    headerHTML: '',
    footerHTML: '',
    whatsappNumber: '',
  });

  useEffect(() => {
    fetchWhiteLabelData();
  }, []);

  const fetchWhiteLabelData = async () => {
    try {
      setLoading(true);
      const response = await whiteLabelService.getMyWhiteLabel();
      const data = response.data.data.whiteLabel;
      
      setFormData({
        domain: data.domain || '',
        companyName: data.companyName || '',
        logoUrl: data.logoUrl || '',
        faviconUrl: data.faviconUrl || '',
        primaryColor: data.primaryColor || '#007bff',
        secondaryColor: data.secondaryColor || '#6c757d',
        backgroundColor: data.backgroundColor || '#ffffff',
        textColor: data.textColor || '#212529',
        fontFamily: data.fontFamily || 'Arial, sans-serif',
        customCSS: data.customCSS || '',
        customJS: data.customJS || '',
        headerHTML: data.headerHTML || '',
        footerHTML: data.footerHTML || '',
        whatsappNumber: data.whatsappNumber || '',
      });
    } catch (error) {
      console.error('Error fetching white-label data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await whiteLabelService.updateWhiteLabel(formData);
      alert('White-label settings saved successfully!');
    } catch (error) {
      console.error('Error saving white-label settings:', error);
      alert('Failed to save white-label settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading white-label settings...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header">
          <h4>White-Label Configuration</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSave}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="domain">Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="e.g., mybrand.com"
                  />
                  <small className="form-text text-muted">Your custom domain for this white-label</small>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g., My Brand"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="whatsappNumber">WhatsApp Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="e.g., 919876543210"
                  />
                  <small className="form-text text-muted">WhatsApp contact number for users</small>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="logoUrl">Logo URL</label>
                  <input
                    type="text"
                    className="form-control"
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                  <small className="form-text text-muted">URL to your logo image</small>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="faviconUrl">Favicon URL</label>
                  <input
                    type="text"
                    className="form-control"
                    id="faviconUrl"
                    name="faviconUrl"
                    value={formData.faviconUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/favicon.ico"
                  />
                  <small className="form-text text-muted">URL to your favicon</small>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <label htmlFor="primaryColor">Primary Color</label>
                  <input
                    type="color"
                    className="form-control"
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="form-group">
                  <label htmlFor="secondaryColor">Secondary Color</label>
                  <input
                    type="color"
                    className="form-control"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="form-group">
                  <label htmlFor="backgroundColor">Background Color</label>
                  <input
                    type="color"
                    className="form-control"
                    id="backgroundColor"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="form-group">
                  <label htmlFor="textColor">Text Color</label>
                  <input
                    type="color"
                    className="form-control"
                    id="textColor"
                    name="textColor"
                    value={formData.textColor}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label htmlFor="fontFamily">Font Family</label>
                  <select
                    className="form-control"
                    id="fontFamily"
                    name="fontFamily"
                    value={formData.fontFamily}
                    onChange={handleChange}
                  >
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="Helvetica, sans-serif">Helvetica</option>
                    <option value="Impact, Charcoal, sans-serif">Impact</option>
                    <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                    <option value="'Trebuchet MS', Helvetica, sans-serif">Trebuchet MS</option>
                    <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
                    <option value="other">Custom Font</option>
                  </select>
                  {formData.fontFamily === 'other' && (
                    <input
                      type="text"
                      className="form-control mt-2"
                      name="fontFamily"
                      value={formData.fontFamily}
                      onChange={handleChange}
                      placeholder="Enter custom font family"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="customCSS">Custom CSS</label>
                  <textarea
                    className="form-control"
                    id="customCSS"
                    name="customCSS"
                    rows={5}
                    value={formData.customCSS}
                    onChange={handleChange}
                    placeholder="Add custom CSS styles here"
                  ></textarea>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="customJS">Custom JavaScript</label>
                  <textarea
                    className="form-control"
                    id="customJS"
                    name="customJS"
                    rows={5}
                    value={formData.customJS}
                    onChange={handleChange}
                    placeholder="Add custom JavaScript here"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="headerHTML">Header HTML</label>
                  <textarea
                    className="form-control"
                    id="headerHTML"
                    name="headerHTML"
                    rows={4}
                    value={formData.headerHTML}
                    onChange={handleChange}
                    placeholder="Custom HTML for header section"
                  ></textarea>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="footerHTML">Footer HTML</label>
                  <textarea
                    className="form-control"
                    id="footerHTML"
                    name="footerHTML"
                    rows={4}
                    value={formData.footerHTML}
                    onChange={handleChange}
                    placeholder="Custom HTML for footer section"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhiteLabelConfig;
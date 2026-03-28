import api from "../utils/api";

export const whiteLabelService = {
  // Get current user's white-label settings
  getMyWhiteLabel: () => {
    return api.get(`/my-white-label`);
  },

  // Update current user's white-label settings
  updateWhiteLabel: (data: any) => {
    return api.put(`/update-white-label`, data);
  },

  // Get white-label settings by domain (for public access)
  getWhiteLabelByDomain: (domain: string) => {
    return api.get(`/domain/${domain}`);
  },

  // Super admin: Create white-label for an admin user
  createWhiteLabel: (data: any) => {
    return api.post(`/create-white-label`, data);
  },

  // Super admin: Get all white-labels
  getAllWhiteLabels: () => {
    return api.get(`/all-white-labels`);
  },

  // Super admin: Toggle white-label status
  toggleWhiteLabelStatus: (whiteLabelId: string, isActive: boolean) => {
    return api.put(`/toggle-white-label/${whiteLabelId}`, { isActive });
  },

  // Get white-label by user ID
  getWhiteLabelByUserId: (userId: string) => {
    return api.get(`/white-label/user/${userId}`);
  },

  // Upload logo image for white-label
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logoImage', file);
    return api.post('/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
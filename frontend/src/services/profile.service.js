import axios from './root.service.js';

export async function getMyProfile() {
  const { data } = await axios.get('/profile/');
  return data.data;
}

export async function changeMyPassword(password, newPassword) {
  const { data } = await axios.patch('/profile/password', { password, newPassword });
  return data;
}

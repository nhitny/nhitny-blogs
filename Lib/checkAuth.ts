const checkAuth = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user;
  } else {
    return null;
  }
};

export { checkAuth };

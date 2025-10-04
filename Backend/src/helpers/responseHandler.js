export const sendResponse = (
  res,
  status,
  message,
  data = null,
  token = null
) => {
  const responsePayload = {
    success: status >= 200 && status < 305,
    message,
  };

  if (token) {
    responsePayload.token = token;
  }
  responsePayload.data = data;
  return res.status(status).json(responsePayload);
};

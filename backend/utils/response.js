
export const successResponse = (
  res,
  data = {},
  message = "Success",
  status = 200,
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "Something went wrong",
  status = 500,
  code = "SERVER_ERROR",
) => {
  return res.status(status).json({
    success: false,
    error: {
      message,
      code,
    },
  });
};

const createCookie = async (req, res, next) => {
  const cookie = req.cookies.res_sess;
  if (!cookie)
    res.cookie("res_sess", "0", { httpOnly: true, sameSite: "none" });
  next();
};

export default createCookie;

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
  
    // If user does not exist, return error
    if (!user) {
      return res.status(400).json({ message: "User does not exist. Please register first." });
    }
  
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  
    // Generate JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
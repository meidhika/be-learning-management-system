import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import TransactionModel from "../models/transactionModel.js";
import transactionModel from "../models/transactionModel.js";
import jwt from "jsonwebtoken";

export const signUpAction = async (req, res) => {
  const mindtransUrl = process.env.MIDTRANS_URL;
  const midtransAuthString = process.env.MIDTRANS_AUTH_STRING;

  try {
    const body = req.body;
    const hashPassword = bcrypt.hashSync(body.password, 12);

    const user = new userModel({
      name: body.name,
      email: body.email,
      password: hashPassword,
      role: "manager",
      photo: "default.png",
    });

    // action payment gateway midtrans
    const transaction = new TransactionModel({
      user: user._id,
      price: 280000,
    });

    const midtrans = await fetch(mindtransUrl, {
      method: "POST",
      body: JSON.stringify({
        transaction_details: {
          order_id: transaction._id.toString(),
          gross_amount: transaction.price,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          email: user.email,
        },
        callbacks: {
          finish: "http://localhost:5173/success-checkout/",
        },
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${midtransAuthString}`,
      },
    });

    const resMidtrans = await midtrans.json();

    await user.save();
    await transaction.save();

    return res.status(200).json({
      message: "Success",
      data: { midtrans_payment_url: resMidtrans.redirect_url },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signInAction = async (req, res) => {
  try {
    const body = req.body;
    const exsistingUser = await userModel
      .findOne()
      .where("email")
      .equals(body.email);

    if (!exsistingUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isPasswordMatch = bcrypt.compareSync(
      body.password,
      exsistingUser.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid Email / Password" });
    }

    const isValidUser = await transactionModel.findOne({
      user: exsistingUser._id,
      status: "pending",
    });

    if (exsistingUser.role === "student" && !isValidUser) {
      return res.status(401).json({ message: "User Not Verified" });
    }

    const token = jwt.sign(
      {
        data: {
          id: exsistingUser._id.toString(),
        },
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1 days" }
    );

    return res.json({
      message: "User Logged in success",
      data: {
        name: exsistingUser.name,
        email: exsistingUser.email,
        token,
        role: exsistingUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

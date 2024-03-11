const Sib = require("sib-api-v3-sdk");
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const apiKey = Sib.ApiClient.instance.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();
const apiInstance = new Sib.ContactsApi();

app.get("/", (req, res) => {
  res.json("welcome to layta email waitlist server");
});

app.post("/subscribe", async (req, res) => {
  const { email, fName, lName, phone } = req.body;

  const sender = {
    email: "info@swiftbuddy.africa",
    name: "Rafiat from SwiftBuddy",
  };

  const receivers = [{ email }];

  try {
    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Rafiat from SwiftBuddy",
      templateId: 1,
      params: { name: fName },
    });

    const createContact = {
      email,
      attributes: {
        LASTNAME: lName,
        FIRSTNAME: fName,
        phone,
        EMAIL: email,
      },
      listIds: [2],
      emailBlacklisted: false,
      smsBlacklisted: false,
      updateEnabled: false,
    };

    await apiInstance.createContact(createContact);

    res.status(200).json("Successfully created");
  } catch (error) {
    let response = error.response.text;
    let jsonResponse = JSON.parse(response);
    res.status(400).json(jsonResponse.message);
  }
});

const port = process.env.REMOTE_CLIENT_APP || 3000;
app.listen(port, () => {
  console.log("Server is up at port", port);
});

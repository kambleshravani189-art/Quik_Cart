const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

const usersFile = path.join(__dirname, "users.json");
const ordersFile = path.join(__dirname, "orders.json");

app.use(cors());
app.use(express.json());

// ---------- USERS ----------
function readUsers() {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, "[]", "utf8");
    }

    const users = JSON.parse(
        fs.readFileSync(usersFile, "utf8") || "[]"
    );

    if (!Array.isArray(users)) {
        throw new Error("users.json must contain an array");
    }

    return users;
}

function saveUsers(users) {
    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}

// ---------- ORDERS ----------
function readOrders() {
    if (!fs.existsSync(ordersFile)) {
        fs.writeFileSync(ordersFile, "[]", "utf8");
    }

    const orders = JSON.parse(
        fs.readFileSync(ordersFile, "utf8") || "[]"
    );

    if (!Array.isArray(orders)) {
        throw new Error("orders.json must contain an array");
    }

    return orders;
}

function saveOrders(orders) {
    fs.writeFileSync(
        ordersFile,
        JSON.stringify(orders, null, 2),
        "utf8"
    );
}

// ---------- HOME ----------
app.get("/", (req, res) => {
    res.send("QuickCart Backend is Running!");
});

// ---------- TEST ----------
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "QuickCart API is working!"
    });
});

// ---------- SIGNUP ----------
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof mobile !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !mobile.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields correctly."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanMobile = mobile.trim();

        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit mobile number."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        const users = readUsers();

        const existingUser = users.find(user =>
            user.mobile === cleanMobile ||
            (
                typeof user.email === "string" &&
                user.email.toLowerCase() === cleanEmail
            )
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Mobile number or email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({
            name: cleanName,
            email: cleanEmail,
            mobile: cleanMobile,
            password: hashedPassword
        });

        saveUsers(users);

        return res.status(201).json({
            success: true,
            message: "Account created successfully!"
        });
    } catch (error) {
        console.error("Signup error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Could not create account."
        });
    }
});

// ---------- LOGIN ----------
app.post("/api/login", async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (
            typeof mobile !== "string" ||
            typeof password !== "string" ||
            !mobile.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter mobile number and password."
            });
        }

        const user = readUsers().find(
            item => item.mobile === mobile.trim()
        );

        if (
            !user ||
            !(await bcrypt.compare(password, user.password))
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password."
            });
        }

        return res.json({
            success: true,
            message: "Login successful!",
            user: {
                name: user.name,
                email: user.email,
                mobile: user.mobile
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
});

// ---------- PLACE ORDER ----------
app.post("/api/orders", (req, res) => {
    try {
        const orderData = req.body;

        if (
            !orderData.customerName ||
            !orderData.mobile ||
            !orderData.items ||
            orderData.items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Incomplete order details."
            });
        }

        const orders = readOrders();
        const newOrderId = "QC" + Math.floor(100000 + Math.random() * 900000);

        const completeOrder = {
            orderId: newOrderId,
            ...orderData,
            date: new Date().toISOString()
        };

        orders.push(completeOrder);
        saveOrders(orders);

        console.log("Order saved:", newOrderId);

        return res.json({
            success: true,
            message: "Order placed successfully!",
            order: completeOrder
        });
    } catch (error) {
        console.error("Order error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error while saving order."
        });
    }
});

// ---------- VIEW SAVED ORDERS ----------
app.get("/api/orders", (req, res) => {
    try {
        res.json({
            success: true,
            orders: readOrders()
        });
    } catch (error) {
        console.error("Read orders error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not read orders."
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`QuickCart Backend running on port ${PORT}`);
});

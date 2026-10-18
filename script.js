/* =====================================================
   QUICKCART - COMPLETE SCRIPT.JS
===================================================== */


/* =====================================================
   CART
===================================================== */


let cart = [];

try {
    const savedCart = JSON.parse(
        localStorage.getItem("quickCart") || "[]"
    );

    cart = Array.isArray(savedCart) ? savedCart : [];
} catch (error) {
    console.error("Cart loading error:", error);
    cart = [];
}



/* Add Product */

function addToCart(name, price) {

    price = Number(price);

    const existingProduct = cart.find(
        item => item.name === name
    );

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();

    updateCartCount();

    alert(name + " added to cart! 🛒");
}


/* Save Cart */

function saveCart() {

    localStorage.setItem(
        "quickCart",
        JSON.stringify(cart)
    );
}


/* Cart Count */

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) return;

    let total = 0;

    cart.forEach(item => {

        total += Number(item.quantity);

    });

    cartCount.innerText = total;
}


/* =====================================================
   DISPLAY CART
===================================================== */

function getProductEmoji(name) {

    const emojis = {

        "Fresh Apples": "🍎",
        "Bananas": "🍌",
        "Oranges": "🍊",
        "Fresh Tomatoes": "🍅",
        "Fresh Broccoli": "🥦",
        "Fresh Carrots": "🥕",
        "Fresh Milk": "🥛",
        "Cheese": "🧀",
        "Fresh Yogurt": "🥣",
        "Chocolate Cookies": "🍪",
        "Potato Chips": "🥔",
        "Milk Chocolate": "🍫",
        "Cold Drink": "🥤",
        "Orange Juice": "🧃",
        "Mineral Water": "💧",
        "Fresh Bread": "🍞",
        "Butter Croissant": "🥐",
        "Chocolate Cake": "🍰",
        "Fresh Eggs": "🥚",
        "Natural Honey": "🍯"

    };

    return emojis[name] || "🛒";
}


function displayCart() {

    const cartItems =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");

    if (!cartItems) return;


    cartItems.innerHTML = "";


    if (cart.length === 0) {

        if (emptyCart) {

            emptyCart.style.display = "block";

        }

        updateSummary();

        return;
    }


    if (emptyCart) {

        emptyCart.style.display = "none";

    }


    cart.forEach((item, index) => {

        const cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";


        cartItem.innerHTML = `

            <div class="cart-item-image">

                ${getProductEmoji(item.name)}

            </div>


            <div class="cart-item-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    Grocery Product
                </p>

                <span class="cart-item-price">
                    ₹${item.price}
                </span>

            </div>


            <div class="cart-item-right">

                <div class="quantity-box">

                    <button
                        onclick="decreaseQuantity(${index})">

                        −

                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        onclick="increaseQuantity(${index})">

                        +

                    </button>

                </div>


                <strong class="item-total">

                    ₹${item.price * item.quantity}

                </strong>


                <button
                    class="remove-btn"
                    onclick="removeFromCart(${index})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        `;


        cartItems.appendChild(cartItem);

    });


    updateSummary();

}


/* Increase */

function increaseQuantity(index) {

    if (!cart[index]) return;

    cart[index].quantity++;

    saveCart();

    displayCart();

    updateCartCount();
}


/* Decrease */

function decreaseQuantity(index) {

    if (!cart[index]) return;


    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }


    saveCart();

    displayCart();

    updateCartCount();
}


/* Remove */

function removeFromCart(index) {

    if (!cart[index]) return;

    cart.splice(index, 1);

    saveCart();

    displayCart();

    updateCartCount();
}


/* =====================================================
   ORDER SUMMARY
===================================================== */

function updateSummary() {

    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryElement =
        document.getElementById("deliveryFee");

    const discountElement =
        document.getElementById("discount");

    const totalElement =
        document.getElementById("total");


    if (!subtotalElement) return;


    let subtotal = 0;


    cart.forEach(item => {

        subtotal +=
            Number(item.price) *
            Number(item.quantity);

    });


    let deliveryFee = 0;

    if (subtotal > 0 && subtotal < 300) {

        deliveryFee = 30;

    }


    let discount = 0;

    if (subtotal >= 500) {

        discount = 50;

    }


    const total =
        subtotal +
        deliveryFee -
        discount;


    subtotalElement.innerText =
        "₹" + subtotal;


    if (deliveryElement) {

        deliveryElement.innerText =
            "₹" + deliveryFee;

    }


    if (discountElement) {

        discountElement.innerText =
            "- ₹" + discount;

    }


    if (totalElement) {

        totalElement.innerText =
            "₹" + total;

    }

}


/* =====================================================
   CHECKOUT
===================================================== */

function checkout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty. Please add some products."
        );

        return;
    }


    window.location.href =
        "checkout.html";

}


/* =====================================================
   LOGIN - BACKEND
===================================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const mobile =
                document.getElementById("mobile")
                .value
                .trim();


            const password =
                document.getElementById("password")
                .value;


            /* Mobile validation */

            if (!/^[0-9]{10}$/.test(mobile)) {

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }


            /* Password validation */

            if (password.length < 6) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/login",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    mobile: mobile,

                                    password: password

                                })

                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    /* Save logged-in user */

                    localStorage.setItem(
                        "quickCartUser",
                        JSON.stringify(data.user)
                    );


                    alert(
                        "Login successful! 🎉"
                    );


                    window.location.href =
                        "index1.html";

                } else {

                    alert(
                        data.message
                    );

                }

            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                alert(
                    "Cannot connect to backend. Make sure server is running."
                );

            }

        }
    );

}


/* =====================================================
   SHOW / HIDE PASSWORD
===================================================== */

function togglePassword() {

    const password =
        document.getElementById("password");

    const icon =
        document.getElementById("showPassword");


    if (!password) return;


    if (password.type === "password") {

        password.type = "text";


        if (icon) {

            icon.classList.remove(
                "fa-eye"
            );

            icon.classList.add(
                "fa-eye-slash"
            );

        }

    } else {

        password.type = "password";


        if (icon) {

            icon.classList.remove(
                "fa-eye-slash"
            );

            icon.classList.add(
                "fa-eye"
            );

        }

    }

}


/* =====================================================
   CONTINUE AS GUEST
===================================================== */

function continueAsGuest() {

    alert(
        "Continuing as guest 🛒"
    );


    window.location.href =
        "index1.html";

}


/* =====================================================
   SIGNUP - BACKEND
===================================================== */

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById("signupName")
                .value
                .trim();


            const mobile =
                document.getElementById("signupMobile")
                .value
                .trim();


            const email =
                document.getElementById("signupEmail")
                .value
                .trim();


            const password =
                document.getElementById("signupPassword")
                .value;


            const confirmPassword =
                document.getElementById("confirmPassword")
                .value;


            /* Name */

            if (!name) {

                alert(
                    "Please enter your name."
                );

                return;
            }


            /* Mobile */

            if (!/^[0-9]{10}$/.test(mobile)) {

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }


            /* Email */

            if (!email) {

                alert(
                    "Please enter your email."
                );

                return;
            }


            /* Password */

            if (password.length < 6) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            /* Confirm Password */

            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match!"
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/signup",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name: name,

                                    email: email,

                                    mobile: mobile,

                                    password: password

                                })

                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    alert(
                        "Account created successfully! 🎉"
                    );


                    signupForm.reset();


                    /* Directly go to Home */

                    window.location.href =
                        "index1.html";

                } else {

                    alert(
                        data.message
                    );

                }

            } catch (error) {

                console.error(
                    "Signup Error:",
                    error
                );


                alert(
                    "Cannot connect to backend. Make sure server is running."
                );

            }

        }
    );

}


/* =====================================================
   SEARCH
===================================================== */

const searchInput =
    document.getElementById("productSearch");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchText =
                this.value
                .toLowerCase()
                .trim();


            const products =
                document.querySelectorAll(
                    ".product"
                );


            let found = 0;


            products.forEach(product => {

                const name =
                    (
                        product.dataset.name || ""
                    )
                    .toLowerCase();


                if (
                    name.includes(searchText)
                ) {

                    product.style.display =
                        "";

                    found++;

                } else {

                    product.style.display =
                        "none";

                }

            });


            const noProducts =
                document.getElementById(
                    "noProducts"
                );


            if (noProducts) {

                noProducts.style.display =
                    found === 0
                        ? "block"
                        : "none";

            }

        }
    );

}


/* =====================================================
   CATEGORY FILTER
===================================================== */

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            const selectedCategory =
                this.dataset.category;


            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            this.classList.add(
                "active"
            );


            const products =
                document.querySelectorAll(
                    ".product"
                );


            let found = 0;


            products.forEach(product => {

                const category =
                    product.dataset.category;


                if (
                    selectedCategory === "all" ||
                    category === selectedCategory
                ) {

                    product.style.display =
                        "";

                    found++;

                } else {

                    product.style.display =
                        "none";

                }

            });


            const noProducts =
                document.getElementById(
                    "noProducts"
                );


            if (noProducts) {

                noProducts.style.display =
                    found === 0
                        ? "block"
                        : "none";

            }

        }
    );

});


/* =====================================================
   INITIALIZE
===================================================== */


updateCartCount();

displayCart();

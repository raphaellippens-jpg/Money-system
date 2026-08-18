/* =========================================================
   MONEY SYSTEM
   SUPABASE VERSION
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://ijvihhdqlfpbbakhfcjn.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_DlhkyCYoKWxdH2Tn_LkjZw_dzhuJmzU";


const supabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   SETTINGS
========================================================= */

/*
   Change this ONE value later if you want
   a different MOM username.
*/

const ADMIN_USERNAME = "mom";


/* =========================================================
   CURRENT USER
========================================================= */

let currentUser = null;


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );


const createScreen =
    document.getElementById(
        "createScreen"
    );


const userScreen =
    document.getElementById(
        "userScreen"
    );


const adminScreen =
    document.getElementById(
        "adminScreen"
    );


const loginUsername =
    document.getElementById(
        "loginUsername"
    );


const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const newUsername =
    document.getElementById(
        "newUsername"
    );


const newPassword =
    document.getElementById(
        "newPassword"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


const createMessage =
    document.getElementById(
        "createMessage"
    );


const userMessage =
    document.getElementById(
        "userMessage"
    );


/* =========================================================
   MONEY
========================================================= */

function moneyToCents(
    amount
) {

    return Math.round(
        Number(amount) * 100
    );

}


function centsToMoney(
    cents
) {

    return cents / 100;

}


function formatMoney(
    amount
) {

    return (
        "€" +
        centsToMoney(
            moneyToCents(amount)
        ).toFixed(2)
    );

}


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function hideAllScreens() {

    loginScreen.classList.add(
        "hidden"
    );

    createScreen.classList.add(
        "hidden"
    );

    userScreen.classList.add(
        "hidden"
    );

    adminScreen.classList.add(
        "hidden"
    );

}


function showLogin() {

    hideAllScreens();

    loginScreen.classList.remove(
        "hidden"
    );

}


function showCreateAccountScreen() {

    hideAllScreens();

    createScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   MESSAGES
========================================================= */

function loginError(
    message
) {

    loginMessage.className =
        "message error";

    loginMessage.textContent =
        message;

}


function createError(
    message
) {

    createMessage.className =
        "message error";

    createMessage.textContent =
        message;

}


function createSuccess(
    message
) {

    createMessage.className =
        "message success";

    createMessage.textContent =
        message;

}


function userSuccess(
    message
) {

    userMessage.className =
        "message success";

    userMessage.textContent =
        message;

    setTimeout(
        function() {

            userMessage.textContent =
                "";

        },
        2500
    );

}


function userError(
    message
) {

    userMessage.className =
        "message error";

    userMessage.textContent =
        message;

    setTimeout(
        function() {

            userMessage.textContent =
                "";

        },
        2500
    );

}


/* =========================================================
   DATABASE ERROR
========================================================= */

function databaseError(
    error
) {

    console.error(
        "Supabase error:",
        error
    );


    if (
        error &&
        error.code === "23505"
    ) {

        return (
            "That username already exists."
        );

    }


    return (
        error?.message ||
        "Database error."
    );

}


/* =========================================================
   FIND ACCOUNT
========================================================= */

async function findAccount(
    username
) {

    const key =
        username
            .trim()
            .toLowerCase();


    const {
        data,
        error
    } =
        await supabase
            .from("accounts")
            .select("*")
            .eq(
                "username",
                key
            )
            .maybeSingle();


    if (error) {

        throw error;

    }


    return data;

}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

async function createAccount() {

    const username =
        newUsername.value
            .trim()
            .toLowerCase();


    const password =
        newPassword.value;


    createMessage.textContent =
        "";


    if (
        username.length < 2
    ) {

        createError(
            "Username must be at least 2 characters."
        );

        return;

    }


    if (
        password.length < 4
    ) {

        createError(
            "Password must be at least 4 characters."
        );

        return;

    }


    try {

        const existing =
            await findAccount(
                username
            );


        if (existing) {

            createError(
                "That username already exists."
            );

            return;

        }


        /*
           MOM is automatically an admin.

           Normal accounts are not.
        */

        const isAdmin =
            username ===
            ADMIN_USERNAME.toLowerCase();


        const {
            error
        } =
            await supabase
                .from("accounts")
                .insert({

                    username:
                        username,

                    password:
                        password,

                    balance:
                        0.00,

                    saved:
                        0.00,

                    is_admin:
                        isAdmin

                });


        if (error) {

            throw error;

        }


        newUsername.value =
            "";

        newPassword.value =
            "";


        createSuccess(
            "Account created!"
        );


        /*
           Automatically return to login.
        */

        setTimeout(
            function() {

                showLogin();

            },
            800
        );

    }

    catch (error) {

        createError(
            databaseError(error)
        );

    }

}


/* =========================================================
   LOGIN
========================================================= */

async function login() {

    const username =
        loginUsername.value
            .trim()
            .toLowerCase();


    const password =
        loginPassword.value;


    loginMessage.textContent =
        "";


    if (
        !username ||
        !password
    ) {

        loginError(
            "Enter your username and password."
        );

        return;

    }


    try {

        const account =
            await findAccount(
                username
            );


        if (!account) {

            loginError(
                "Account does not exist."
            );

            return;

        }


        if (
            account.password !==
            password
        ) {

            loginError(
                "Incorrect password."
            );

            return;

        }


        currentUser =
            account;


        loginUsername.value =
            "";

        loginPassword.value =
            "";


        if (
            account.is_admin === true
        ) {

            showAdminPanel();

        } else {

            showUserPanel();

        }

    }

    catch (error) {

        loginError(
            databaseError(error)
        );

    }

}


/* =========================================================
   USER PANEL
========================================================= */

function showUserPanel() {

    hideAllScreens();

    userScreen.classList.remove(
        "hidden"
    );

    updateUserDisplay();

}


function updateUserDisplay() {

    if (!currentUser) {

        return;

    }


    document.getElementById(
        "welcomeText"
    ).textContent =
        "Welcome, " +
        currentUser.username +
        "!";


    document.getElementById(
        "balanceValue"
    ).textContent =
        formatMoney(
            currentUser.balance
        );


    document.getElementById(
        "savedValue"
    ).textContent =
        formatMoney(
            currentUser.saved
        );

}


/* =========================================================
   REFRESH USER
========================================================= */

async function refreshUser() {

    if (!currentUser) {

        return;

    }


    const account =
        await findAccount(
            currentUser.username
        );


    if (!account) {

        currentUser =
            null;

        showLogin();

        return;

    }


    currentUser =
        account;


    updateUserDisplay();

}


/* =========================================================
   BUY
========================================================= */

async function buyMoney() {

    const input =
        prompt(
            "How much do you want to buy?"
        );


    if (
        input === null
    ) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        userError(
            "Enter a valid amount."
        );

        return;

    }


    const balanceCents =
        moneyToCents(
            currentUser.balance
        );


    if (
        amountCents >
        balanceCents
    ) {

        userError(
            "🚨 INSUFFICIENT FUNDS!"
        );

        return;

    }


    const newBalance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    try {

        const {
            error
        } =
            await supabase
                .from("accounts")
                .update({

                    balance:
                        newBalance

                })
                .eq(
                    "id",
                    currentUser.id
                );


        if (error) {

            throw error;

        }


        currentUser.balance =
            newBalance;


        updateUserDisplay();


        userSuccess(
            "Purchase successful!"
        );

    }

    catch (error) {

        userError(
            databaseError(error)
        );

    }

}


/* =========================================================
   SAVE
========================================================= */

async function saveMoney() {

    const input =
        prompt(
            "How much do you want to save?"
        );


    if (
        input === null
    ) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        userError(
            "Enter a valid amount."
        );

        return;

    }


    const balanceCents =
        moneyToCents(
            currentUser.balance
        );


    const savedCents =
        moneyToCents(
            currentUser.saved
        );


    if (
        amountCents >
        balanceCents
    ) {

        userError(
            "🚨 INSUFFICIENT FUNDS!"
        );

        return;

    }


    const newBalance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    const newSaved =
        centsToMoney(
            savedCents +
            amountCents
        );


    try {

        const {
            error
        } =
            await supabase
                .from("accounts")
                .update({

                    balance:
                        newBalance,

                    saved:
                        newSaved

                })
                .eq(
                    "id",
                    currentUser.id
                );


        if (error) {

            throw error;

        }


        currentUser.balance =
            newBalance;


        currentUser.saved =
            newSaved;


        updateUserDisplay();


        userSuccess(
            "Money saved!"
        );

    }

    catch (error) {

        userError(
            databaseError(error)
        );

    }

}


/* =========================================================
   WITHDRAW
========================================================= */

async function withdrawMoney() {

    const input =
        prompt(
            "How much do you want to withdraw?"
        );


    if (
        input === null
    ) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        userError(
            "Enter a valid amount."
        );

        return;

    }


    const savedCents =
        moneyToCents(
            currentUser.saved
        );


    if (
        amountCents >
        savedCents
    ) {

        userError(
            "🚨 NOT ENOUGH SAVED MONEY!"
        );

        return;

    }


    const balanceCents =
        moneyToCents(
            currentUser.balance
        );


    const newSaved =
        centsToMoney(
            savedCents -
            amountCents
        );


    const newBalance =
        centsToMoney(
            balanceCents +
            amountCents
        );


    try {

        const {
            error
        } =
            await supabase
                .from("accounts")
                .update({

                    balance:
                        newBalance,

                    saved:
                        newSaved

                })
                .eq(
                    "id",
                    currentUser.id
                );


        if (error) {

            throw error;

        }


        currentUser.balance =
            newBalance;


        currentUser.saved =
            newSaved;


        updateUserDisplay();


        userSuccess(
            "Money withdrawn!"
        );

    }

    catch (error) {

        userError(
            databaseError(error)
        );

    }

}


/* =========================================================
   MOM PANEL
========================================================= */

function showAdminPanel() {

    hideAllScreens();

    adminScreen.classList.remove(
        "hidden"
    );

    refreshAdminPanel();

}


/* =========================================================
   MOM: LOAD ACCOUNTS
========================================================= */

async function refreshAdminPanel() {

    const list =
        document.getElementById(
            "accountList"
        );


    list.innerHTML =
        "<p>Loading accounts...</p>";


    try {

        const {
            data,
            error
        } =
            await supabase
                .from("accounts")
                .select(
                    "id, username, balance, saved, is_admin"
                )
                .order(
                    "username"
                );


        if (error) {

            throw error;

        }


        list.innerHTML =
            "";


        const normalAccounts =
            data.filter(
                function(account) {

                    return (
                        account.is_admin !== true
                    );

                }
            );


        if (
            normalAccounts.length === 0
        ) {

            list.innerHTML =
                "<p>No normal accounts yet.</p>";

            return;

        }


        normalAccounts.forEach(
            function(account) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "account";


                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "accountInfo";


                info.innerHTML =
                    `
                    <div class="accountName">
                        👤 ${escapeHTML(account.username)}
                    </div>

                    <div class="accountMoney">
                        💶 Balance: €${formatMoney(account.balance)}
                    </div>

                    <div class="accountMoney">
                        🏦 Saved: €${formatMoney(account.saved)}
                    </div>
                    `;


                const buttons =
                    document.createElement(
                        "div"
                    );


                buttons.className =
                    "adminButtons";


                const increase =
                    document.createElement(
                        "button"
                    );


                increase.className =
                    "increase";


                increase.textContent =
                    "➕ Increase balance";


                increase.addEventListener(
                    "click",
                    function() {

                        increaseBalance(
                            account.id
                        );

                    }
                );


                /*
                   IMPORTANT:

                   MOM CANNOT DELETE OTHER
                   PEOPLE'S ACCOUNTS.
                */


                buttons.appendChild(
                    increase
                );


                card.appendChild(
                    info
                );


                card.appendChild(
                    buttons
                );


                list.appendChild(
                    card
                );

            }
        );

    }

    catch (error) {

        list.innerHTML =
            "<p class='error'>" +
            escapeHTML(
                databaseError(error)
            ) +
            "</p>";

    }

}


/* =========================================================
   MOM: INCREASE BALANCE
========================================================= */

async function increaseBalance(
    accountId
) {

    const input =
        prompt(
            "How much do you want to add?"
        );


    if (
        input === null
    ) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabase
                .from("accounts")
                .select(
                    "balance"
                )
                .eq(
                    "id",
                    accountId
                )
                .single();


        if (error) {

            throw error;

        }


        const oldBalanceCents =
            moneyToCents(
                data.balance
            );


        const newBalance =
            centsToMoney(
                oldBalanceCents +
                amountCents
            );


        const {
            error:
                updateError
        } =
            await supabase
                .from("accounts")
                .update({

                    balance:
                        newBalance

                })
                .eq(
                    "id",
                    accountId
                );


        if (updateError) {

            throw updateError;

        }


        await refreshAdminPanel();


        alert(
            "Added €" +
            formatMoney(amount) +
            "."
        );

    }

    catch (error) {

        alert(
            databaseError(error)
        );

    }

}


/* =========================================================
   DELETE OWN ACCOUNT
========================================================= */

async function deleteOwnAccount() {

    if (!currentUser) {

        return;

    }


    const confirmed =
        confirm(
            "Delete your account?\n\n" +
            "Your Balance and Saved money will be deleted."
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabase
            .from("accounts")
            .delete()
            .eq(
                "id",
                currentUser.id
            );


    if (error) {

        userError(
            databaseError(error)
        );

        return;

    }


    currentUser =
        null;


    alert(
        "Account deleted."
    );


    showLogin();

}


/* =========================================================
   MOM DELETE OWN ACCOUNT
========================================================= */

async function deleteMomAccount() {

    if (
        !currentUser ||
        currentUser.is_admin !== true
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Delete the MOM account?\n\n" +
            "This cannot be undone."
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabase
            .from("accounts")
            .delete()
            .eq(
                "id",
                currentUser.id
            );


    if (error) {

        alert(
            databaseError(error)
        );

        return;

    }


    currentUser =
        null;


    alert(
        "MOM account deleted."
    );


    showLogin();

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser =
        null;


    loginUsername.value =
        "";

    loginPassword.value =
        "";


    loginMessage.textContent =
        "";


    userMessage.textContent =
        "";


    showLogin();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    text
) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById(
        "loginButton"
    )
    .addEventListener(
        "click",
        login
    );


document
    .getElementById(
        "showCreateButton"
    )
    .addEventListener(
        "click",
        showCreateAccountScreen
    );


document
    .getElementById(
        "createButton"
    )
    .addEventListener(
        "click",
        createAccount
    );


document
    .getElementById(
        "backToLoginButton"
    )
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById(
        "buyButton"
    )
    .addEventListener(
        "click",
        buyMoney
    );


document
    .getElementById(
        "saveButton"
    )
    .addEventListener(
        "click",
        saveMoney
    );


document
    .getElementById(
        "withdrawButton"
    )
    .addEventListener(
        "click",
        withdrawMoney
    );


document
    .getElementById(
        "userLogoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "adminLogoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "deleteOwnAccountButton"
    )
    .addEventListener(
        "click",
        deleteOwnAccount
    );


document
    .getElementById(
        "deleteMomButton"
    )
    .addEventListener(
        "click",
        deleteMomAccount
    );


/* =========================================================
   ENTER KEY
========================================================= */

loginPassword.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            login();

        }

    }
);


newPassword.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            createAccount();

        }

    }
);


/* =========================================================
   START
========================================================= */

showLogin();

console.log(
    "💰 Money System started."
);

console.log(
    "☁️ Supabase connected:",
    SUPABASE_URL
);

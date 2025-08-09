// --- Game State Variables ---
let ingredients = {
    dough: 1000,
    tomatoSauce: 1000,
    cheese: 1000,
    pepperoni: 1000,
    mushrooms: 1000,
    onion:  1000,
    ham:  1000, 
    olives:  1000
};

let customerOrders = []; // Stores incoming customer orders
let currentOrder = null; // The order the player is currently working on
let pizzaInOven = null; // Represents a pizza being made
let gameMessage = "";

// --- DOM Elements ---
const customerOrderList = document.getElementById('customer-order-list');
const ingredientList = document.getElementById('ingredient-list');
const takeOrderBtn = document.getElementById('take-order-btn');
const makePizzaBtn = document.getElementById('make-pizza-btn');
const serveOrderBtn = document.getElementById('serve-order-btn');
const gameMessageElement = document.getElementById('game-message');

// --- Game Functions ---

// Function to update the display of ingredients
function updateIngredientsDisplay() {
    ingredientList.innerHTML = ''; // Clear current list
    for (const item in ingredients) {
        const li = document.createElement('li');
        li.textContent = `${item.charAt(0).toUpperCase() + item.slice(1)}: ${ingredients[item]}`;
        ingredientList.appendChild(li);
    }
}

// Function to update the display of customer orders
function updateCustomerOrdersDisplay() {
    customerOrderList.innerHTML = ''; // Clear current list

    if (customerOrders.length === 0 && !currentOrder) {
        const li = document.createElement('li');
        li.textContent = "No new orders for now. Enjoy the peace!";
        customerOrderList.appendChild(li);
        return;
    }

    // Display current order if any
    if (currentOrder) {
        const li = document.createElement('li');
        li.classList.add('current-order'); // Add class for styling
        li.textContent = `Current: Pizza with ${currentOrder.toppings.join(', ')}`;
        customerOrderList.appendChild(li);
    }

    // Display other waiting orders
    customerOrders.forEach(order => {
        const li = document.createElement('li');
        li.textContent = `Waiting: Pizza with ${order.toppings.join(', ')}`;
        customerOrderList.appendChild(li);
    });
}

// Function to display game messages
function displayGameMessage(message, isError = false) {
    gameMessageElement.textContent = message;
    gameMessageElement.style.color = isError ? '#d9534f' : '#4CAF50'; // Red for error, green for success
}

// Function to generate a random customer order
function generateOrder() {
    const possibleToppings = ['pepperoni', 'mushrooms', 'onion', 'olives', 'ham'];
    const numToppings = Math.floor(Math.random() * 3) + 1; // 1 to 3 toppings
    let selectedToppings = [];
    while (selectedToppings.length < numToppings) {
        const randomTopping = possibleToppings[Math.floor(Math.random() * possibleToppings.length)];
        if (!selectedToppings.includes(randomTopping)) {
            selectedToppings.push(randomTopping);
        }
    }
    // Basic ingredients for any pizza
    selectedToppings.unshift('dough', 'tomatoSauce', 'cheese');
    return {
        id: Date.now(), // Unique ID for the order
        toppings: selectedToppings,
        status: 'waiting' // 'waiting', 'making', 'ready'
    };
}

// --- Player Action Handlers ---

takeOrderBtn.addEventListener('click', () => {
    if (currentOrder) {
        displayGameMessage("You already have an order in progress!", true);
        return;
    }
    if (customerOrders.length > 0) {
        currentOrder = customerOrders.shift(); // Take the first waiting order
        currentOrder.status = 'making';
        displayGameMessage(`You took an order for a pizza with ${currentOrder.toppings.join(', ')}.`);
        updateCustomerOrdersDisplay();
        makePizzaBtn.disabled = false; // Enable make pizza button
    } else {
        // If no orders, generate a new one immediately for simplicity
        const newOrder = generateOrder();
        customerOrders.push(newOrder);
        displayGameMessage("A new customer just arrived!");
        updateCustomerOrdersDisplay();
    }
});

makePizzaBtn.addEventListener('click', () => {
    if (!currentOrder) {
        displayGameMessage("First, take an order!", true);
        return;
    }
    if (pizzaInOven) {
        displayGameMessage("There's already a pizza in the oven!", true);
        return;
    }

    let hasIngredients = true;
    let missingIngredients = [];

    // Check if player has all ingredients
    currentOrder.toppings.forEach(topping => {
        // We'll assume basic toppings exist in `ingredients` object for now
        // A more robust check would involve specific ingredient costs
        if (ingredients[topping] === undefined || ingredients[topping] < 1) {
            hasIngredients = false;
            missingIngredients.push(topping);
        }
    });

    if (!hasIngredients) {
        displayGameMessage(`Missing ingredients: ${missingIngredients.join(', ')}`, true);
        return;
    }

    // Deduct ingredients
    currentOrder.toppings.forEach(topping => {
        if (ingredients[topping] !== undefined) {
            ingredients[topping]--;
        }
    });
    updateIngredientsDisplay();

    pizzaInOven = currentOrder; // Place pizza in oven (conceptually)
    currentOrder = null; // Clear current order as it's now being 'made'

    displayGameMessage(`Making a pizza with ${pizzaInOven.toppings.join(', ')}...`);
    makePizzaBtn.disabled = true; // Disable making another pizza until this one is served
    serveOrderBtn.disabled = false; // Enable serving button after 'making'

    // In a real game, this would involve a timer for baking
    // For now, we instantly make it 'ready' for serving
    pizzaInOven.status = 'ready';
});

serveOrderBtn.addEventListener('click', () => {
    if (!pizzaInOven || pizzaInOven.status !== 'ready') {
        displayGameMessage("There's no ready pizza to serve!", true);
        return;
    }

    displayGameMessage(`Served pizza with ${pizzaInOven.toppings.join(', ')}! Good job!`);
    pizzaInOven = null; // Pizza served
    serveOrderBtn.disabled = true; // Disable until new pizza is ready

    // Re-enable take order and make pizza buttons if no current order or pizza in oven
    if (!currentOrder && !pizzaInOven) {
        takeOrderBtn.disabled = false;
        // makePizzaBtn will be enabled by taking a new order
    }
    updateCustomerOrdersDisplay();
});

// --- Initial Game Setup ---
function initializeGame() {
    updateIngredientsDisplay();
    updateCustomerOrdersDisplay();
    // Start with a few initial orders
    customerOrders.push(generateOrder());
    customerOrders.push(generateOrder());
    updateCustomerOrdersDisplay();

    // Disable buttons initially until an order is taken/made
    makePizzaBtn.disabled = true;
    serveOrderBtn.disabled = true;
}

// Run when the page loads
initializeGame();

// --- Game Loop (Simplified for now) ---
// This could be used for recurring events like new orders, ingredient restocks etc.
setInterval(() => {
    // Every few seconds, there's a chance a new order arrives
    if (Math.random() < 0.3 && customerOrders.length < 3 && !currentOrder && !pizzaInOven) { // Limit waiting orders
        customerOrders.push(generateOrder());
        displayGameMessage("A new customer just arrived!");
        updateCustomerOrdersDisplay();
    }
}, 5000); // Check every 5 seconds
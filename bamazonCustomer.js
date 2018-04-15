// =================================< environment variables >================================== //
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');

// =================================< functions >===================================================== // 

function showItemsForSale() {

    connection.query('SELECT `item_id`,`product_name`,`price` FROM `products`', function (error, results, fields) {
        if (error) throw error;

        // display item, product, price from the products table using the npm package console.table. 
        console.table('\n  Welcome to the Bamazon Store !',results);

        promptForSale();
    })
}

function promptForSale() {
    // collect item_id and quantity from customer to process each order.
    inquirer.prompt([
        {
            name: "promptItemId",
            type: "input",
            message: "Please enter the Item Id of a product you would like to buy.",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "promptItemQty",
            type: "input",
            message: "\nHow many items would you like to buy?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (custInput) {
        // cast item and qty as integers.
        var item = parseInt(custInput.promptItemId);
        var qty = parseInt(custInput.promptItemQty);

        checkStock(item, qty);
    });
}

function checkStock(item, qty) {

    connection.query('SELECT `stock_quantity`, `price` FROM `products` WHERE `item_id` = ?', [item], function (error, results, fields) {
        if (error) throw error;
        // if item is in stock, update the products quantity count and calc the cost of the transaction.
        if (results[0].stock_quantity > qty) {
            // calculate total cost of the transaction. 
            var tempTotal = parseFloat(results[0].price * qty);
            // round the temp total down to two decimal places. 
            var roundedTotal = tempTotal.toFixed(2);
            // cast the rounded string total back to a decimal number. 
            var custTotal = parseFloat(roundedTotal);
            // deduct the nbr of items ordered from the current stock_quantity to determine the revised stock qty.
            var revisedStockQty = (parseInt(results[0].stock_quantity) - qty);

            updateStock(item, revisedStockQty, custTotal);
        }
        else {
            // send 'item not in stock' message back to the customer. 
            console.log("\nSorry, that item is not in stock at this time. \nPlease check back later. Thank You!")

            promptToContinue();
        }
    });
}

function updateStock(item, revisedQty, total) {

    connection.query('UPDATE `products` SET ? WHERE ?',
        [
            {
                stock_quantity: revisedQty,
                product_sales: total
            },
            {
                item_id: item
            }
        ],
        function (error, results) {
            if (error) throw error;
            // if update successful, send total cost message back to customer. 
            console.log("\nThe total cost of this purchase is $" + total);

            promptToContinue();
        }
    );
}

function promptToContinue() {
    inquirer.prompt([
        {
            name: "promptContinue",
            type: "confirm",
            message: "\nWould you like to continue shopping (Y/N)?",
        }
    ]).then(function (shopperInput) {
        
        if (shopperInput.promptContinue === true) {
            showItemsForSale();
        }
        else {
            connection.end();
        }
    });
}
// =================================< main process>============================================ //

// create a connection to the bamazon database.
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});
// connect to the bamazon database.
connection.connect(function (err) {
    if (err) throw err;
});
// display all items for sale to the customer.
showItemsForSale();

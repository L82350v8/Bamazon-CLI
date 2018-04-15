// =================================< environment variables >========================================= //
const inquirer = require("inquirer");
const mysql = require("mysql");
const eTable = require('easy-table');
const cTable = require('console.table');


// =================================< functions >===================================================== // 

function productsForSaleRpt() {

    connection.query('SELECT `item_id`,`product_name`,`price`,`stock_quantity`FROM `products`', function (error, results, fields) {
        if (error) throw error;

        // Note: The leading spaces below help to center the report header.
        console.log('\n           Products for Sale Report',);
        console.log(eTable.print(results, {
            item_id: {name: 'Item Id'},
            product_name: {name: 'Product'},
            price: { name: 'Price', printer: eTable.number(2) },
            stock_quantity: {name: 'Quantity On Hand'}
        }))
        promptToContinue();
    })
}

function lowInventoryRpt() {
    
    connection.query('SELECT `item_id`,`product_name`,`stock_quantity` FROM `products` WHERE `stock_quantity` < ?', [5], function (error, results, fields) {
        if (error) throw error;
    
        if (results.length > 0) {
            // Note: The leading spaces below help to center the report header. 
            console.table('\n           Low Inventory Report', results);
        }
        else {
            // If no low inventory items were found generate a no items found header. 
            console.log('\n           Low Inventory Report');
            console.log("------------------------------------------");
            console.log("\n    No low inventory items found.\n");
        }
        promptToContinue();
    })
}

function addToInventory() {

    inquirer.prompt([
        {
            name: "addItemId",
            type: "input",
            message: "Please enter the Item Id of the product where the quantity is to be increased:",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "addQty",
            type: "input",
            message: "\nHow many items would you like to add?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (invInput) {

        // cast as integers.
        var invAddItem = parseInt(invInput.addItemId);
        var invAddQty = parseInt(invInput.addQty);

        getStockQty(invAddItem, invAddQty);
    });
}

function addNewProduct() {

    inquirer.prompt([
        {
            name: "addProductName",
            type: "input",
            message: "Enter the name of the new product:",
        },
        {
            name: "addProductDept",
            type: "input",
            message: "What is the department name for the new product?",
        },
        {
            name: "addProductPrice",
            type: "input",
            message: "What is the retail price for the new product?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "addProductQty",
            type: "input",
            message: "How many units are in stock for this new product?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (newProductInput) {

        connection.query("INSERT INTO products SET ?",
            {
                product_name: newProductInput.addProductName,
                department_name: newProductInput.addProductDept,
                price: newProductInput.addProductPrice,
                stock_quantity: newProductInput.addProductQty
            },
            function (error, results) {
                if (error) throw error;

                console.log("New product successfully created.\n");

                promptToContinue();
            }
        );
    });
}

function getStockQty(addItemId, addQty) {

    connection.query('SELECT `stock_quantity` FROM `products` WHERE `item_id` = ?', [addItemId], function (error, results, fields) {
        if (error) throw error;

        // add the current stock quantity to the added quantity to get the revised stock quantity for the item.
        var currStockQty = results[0].stock_quantity;
        var revisedStkQty = currStockQty + addQty;

        updateStockQty(addItemId, revisedStkQty);
    })
}

function updateStockQty(addItemId, newStkQty) {

    // update the stock_quantity of the item with the revised stock quantity.
    connection.query('UPDATE `products` SET ? WHERE ?',
        [
            {
                stock_quantity: newStkQty,
            },
            {
                item_id: addItemId
            }
        ],
        function (error, results) {
            if (error) throw error;

            console.log("Your update was successful.")
            promptToContinue();
        }
    );
}

function presentMenuOptions() {

    console.log("\nWelcome to the Bamazon Products application\n============== Manager View ===============\n");

    // present a list of processing options to the user.
    inquirer.prompt([
        {
            type: "list",
            name: "menuChoice",
            message: "Please select a menu option to proceed:",
            choices: ["View Products for sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"]
        }
    ]).then(function (mgrInput) {

        var mgrChoice = mgrInput.menuChoice;

        switch (mgrChoice) {
            case "View Products for sale":
                productsForSaleRpt();
                break;
            case "View Low Inventory":
                lowInventoryRpt();
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            default:
                console.log("bamazonManager.js command line error encountered! Unable to identify a command.")
        }
    });
}

function promptToContinue() {

    inquirer.prompt([
        {
            name: "continueChoice",
            type: "confirm",
            message: "Would you like to continue (Y/N)?",
        }
    ]).then(function (continueInput) {

        if (continueInput.continueChoice === true) {
            presentMenuOptions();
        }
        else {
            connection.end();
        }
    });
}


// =================================< main process>=================================================== //

// create a connection to the database.
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});
// connect to the database.
connection.connect(function (err) {
    if (err) throw err;
});
// present user with a menu of processing options.
presentMenuOptions(); 
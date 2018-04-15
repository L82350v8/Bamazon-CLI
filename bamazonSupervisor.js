// =================================< environment variables >========================================= //
const inquirer = require("inquirer");
const mysql = require("mysql");
const eTable = require('easy-table');
const cTable = require('console.table');

// =================================< functions >===================================================== // 
function salesByDeptRpt() {

    connection.query('SELECT dept.department_id, dept.department_name, dept.over_head_costs, CASE WHEN prod.product_sales IS NULL THEN 0 ELSE sum(prod.product_sales) END AS product_sales, CASE WHEN sum(prod.product_sales) IS NULL THEN 0 - dept.over_head_costs ELSE sum(prod.product_sales) - dept.over_head_costs END AS total_profit FROM bamazon.departments as dept LEFT OUTER JOIN bamazon.products as prod ON dept.department_name = prod.department_name group by department_name', function (error, results, fields) {
         if (error) throw error;

        console.log('\n               Sales by Department Report');
        console.log(eTable.print(results, {
            department_id: { name: 'Dept. Id' },
            department_name: { name: 'Department' },
            over_head_costs: { name: 'Overhead Costs', printer: eTable.number(2) },
            sales: { name: 'Total Sales', printer: eTable.number(2) },
            total_profit: { name: 'Total Profit', printer: eTable.number(2) }
        }))
        promptToContinue();
    })
}

function createNewDept() {

    inquirer.prompt([
        {
            name: "newDeptName",
            type: "input",
            message: "What is the name of the new department?",
        },
        {
            name: "newDeptOvrhdCosts",
            type: "input",
            message: "What are the overhead costs for the new department?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (newDeptInput) {

        var deptName = newDeptInput.newDeptName;
        var ovrhdCosts = newDeptInput.newDeptOvrhdCosts;

        connection.query("INSERT INTO departments SET ?",
            {
                department_name: deptName,
                over_head_costs: ovrhdCosts,
            },
            function (error, results) {
                if (error) throw error;
                console.log("New department successfully created.\n");
                promptToContinue();
            }
        );
    });
}

function presentMenuOptions() {

    console.log("\nWelcome to the Bamazon Departments application\n============== Supervisor View ===============\n");

    // present user with a list of processing options and ask them to select one. 
    inquirer.prompt([
        {
            type: "list",
            name: "menuChoice",
            message: "Please select a menu option to proceed:",
            choices: ["View Product Sales by Department",
                      "Create a New Department"]
        }
    ]).then(function (suprInput) {

        var suprChoice = suprInput.menuChoice;

        switch (suprChoice) {
            case "View Product Sales by Department":
                salesByDeptRpt();
                break;
            case "Create a New Department":
                createNewDept();
                break;
            default:
                console.log("bamazonSupervisor.js command line error encountered! Unable to identify a command.")
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
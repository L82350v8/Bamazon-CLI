
CREATE DATABASE IF NOT EXISTS bamazon;

USE bamazon;

CREATE TABLE IF NOT EXISTS products (
item_id         INT(10)      NOT NULL AUTO_INCREMENT, 
product_name    CHAR(30)     NOT NULL, 
department_name CHAR(30)     NOT NULL, 
price           DECIMAL(5,2) NOT NULL,
stock_quantity  INT(10)      NOT NULL DEFAULT 0, 
product_sales   DECIMAL(9,2) NOT NULL DEFAULT 0,
PRIMARY KEY (item_id)
);
  
-- k1 index to support foreign key to departments table.  
CREATE INDEX products_k1 
  ON products 
  (department_name);
  
CREATE TABLE IF NOT EXISTS departments (
department_id    INT(10) NOT NULL AUTO_INCREMENT, 
department_name  CHAR(30)     NOT NULL, 
over_head_costs  DECIMAL(9,2) NOT NULL,
PRIMARY KEY (department_id)
);

 
CREATE INDEX departments_k1 
  ON departments 
  (department_name);
  
  
ALTER TABLE products  
  ADD FOREIGN KEY products_ibfk_1 
      (department_name)
      REFERENCES departments 
      (department_name)
      ON DELETE RESTRICT;
  

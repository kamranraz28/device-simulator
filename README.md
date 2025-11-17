Requirements

Ensure the following are installed on your system:

PHP 8.2 or higher

Composer

Node.js & npm

React.js

MySQL Database

Installation & Setup

Follow the steps below to run the application locally:

Clone the Repository

git clone https://github.com/kamranraz28/device-simulator.git

cd device-simulator


Create Environment File

cp .env.example .env


Update your .env file with correct MySQL database credentials.

Install Backend Dependencies

composer install


Install Frontend Dependencies

npm install


Generate Application Key

php artisan key:generate


Run Database Migrations

php artisan migrate


Build Frontend Assets

npm run dev


Start the Development Server

php artisan serve


The application will be available at:
http://127.0.0.1:8000

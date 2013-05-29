<?php
/**
 * SOGoAccountsManager - a web-based users accounts manager which
 *                       integrates well with SOGo
 * Copyright (c) 2011-2012 Romain LE DISEZ
 *
 * This file is part of SOGoAccountsManager.
 *
 * SOGoAccountsManager is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SOGoAccountsManager is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with SOGoAccountsManager.  If not, see <http://www.gnu.org/licenses/>.
 */

set_include_path(ini_get('include_path')  . PATH_SEPARATOR .
    dirname(dirname(__FILE__)).'/library' . PATH_SEPARATOR .
    dirname(dirname(__FILE__)).'/application');


require 'Slim/Slim.php';
\Slim\Slim::registerAutoloader();

require 'Zend/Loader/StandardAutoloader.php';
$zendAutoloader = new \Zend\Loader\StandardAutoloader();
$zendAutoloader->setFallbackAutoloader(true);
$zendAutoloader->register();


$app = new \Slim\Slim();
$app->config( include 'config.php' );
$app->add(new \Slim\Middleware\ContentTypes());
$app->add(new \SOGoAccountsManager\Middleware\SOGoSession());
$app->add(new \SOGoAccountsManager\Middleware\SOGoConfiguration());
$app->add(new \SOGoAccountsManager\Middleware\JsonExceptions());


$app->get('/checkAuth', function () use($app) {
    $className = '\SOGoAccountsManager\Authentication';
    $auth = new $className($app);
    $auth->check();
});

// Accounts routes
$app->get('/accounts', function () use($app) {
    $className = $app->config('informationsStore.namespace') .'\Accounts';
    $accounts = new $className($app);
    $accounts->getAll();
});

$app->post('/accounts', function () use($app) {
    $className = $app->config('informationsStore.namespace') .'\Accounts';
    $accounts = new $className($app);
    $accounts->create();
});

$app->get('/accounts/:id', function ($id) use($app) {
    $className = $app->config('informationsStore.namespace') .'\Accounts';
    $accounts = new $className($app);
    $accounts->getById($id);
});

$app->put('/accounts/:id', function ($id) use($app) {
    $className = $app->config('informationsStore.namespace') .'\Accounts';
    $accounts = new $className($app);
    $accounts->update($id);
});

$app->delete('/accounts/:id', function ($id) use($app) {
    $className = $app->config('informationsStore.namespace') .'\Accounts';
    $accounts = new $className($app);
    $accounts->delete($id);
});


$app->run();

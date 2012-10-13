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

namespace SOGoAccountsManager\InformationsStore;

abstract class AbstractAccounts
{
    /**
     * @var Slim
     */
    protected $app;

    /**
     * HTTP response
     */
    protected $response;

    /**
     * Constructor
     *
     * @param   Slim $app
     * @return  void
     */
    public function __construct(\Slim\Slim $app)
    {
        $this->app = $app;
        $this->app->contentType('application/json');
        $this->response = $this->app->response();
    }

    /**
     * Destructor
     */
    public function __destruct()
    {}

    /**
     * Return all accounts to response.
     * @return  void
     */
    public abstract function getAll();

    /**
     * Return the account of the specified ID.
     * @return  void
     */
    public abstract function getById($id);

    /**
     * Create an account from the request body.
     * @return  void
     */
    public abstract function create();

    /**
     * Update an account from the request body.
     * @return  void
     */
    public abstract function update($id);

    /**
     * Delete the account of the specified ID.
     * @return  void
     */
    public abstract function delete($id);
}

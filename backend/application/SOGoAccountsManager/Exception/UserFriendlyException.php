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

namespace SOGoAccountsManager\Exception;

use stdclass;
use Exception;

class UserFriendlyException extends Exception
{
    public function __construct($httpCode, $message, $description = null, $args = null, $previous = null)
    {
        if( !is_int($httpCode) ) {
            $httpCode = 500;
        }
        if( empty($message) || !is_string($message) ) {
            $message = 'An unexpected error happened';
        }

        $errorObj = new stdclass();
        $errorObj->message = $message;
        if( !empty($description) && is_string($description) ) {
            $errorObj->description = $description;
        }
        if( !empty($args) ) {
            $errorObj->args = $args;
        }

        parent::__construct(json_encode($errorObj), $httpCode, $previous);
    }
}

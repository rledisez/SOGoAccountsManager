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

namespace Generic\SOGoMut;

use Exception;

use \SOGoAccountsManager\Exception\UserFriendlyException;

use \Zend\Ldap\Attribute;
use \Zend\Ldap\Filter;
use \Zend\Ldap\Collection\DefaultIterator;
use \Zend\Validator\EmailAddress;

class Accounts extends \SOGoAccountsManager\InformationsStore\AbstractAccounts
{
    /**
     * @var resource A LDAP link identifier.
     */
    private $ldap = false;

    /**
     * @var string The DN of the LDAP branch the user is allowed to access
     */
    private $userBaseDn;

    private $entryAttr = array(
        'employeeNumber',
        'cn',
        'givenName',
        'sn',
        'mail',
        'mailAlias',
        'title',
        'ou',
        'o',
        'street',
        'l',
        'st',
        'postalCode',
        'telephoneNumber',
        'homePhone',
        'mobile',
        'facsimileTelephoneNumber',
        'pager'
    );

    public function __construct(\Slim\Slim $app)
    {
        parent::__construct($app);

        $env = $this->app->environment();

        $this->ldap = new Ldap( $this->app->config('informationsStore.params.ldap') );
        $this->ldap->bind();
        $this->userBaseDn = $this->ldap->getUserBaseDn($env['SOGoAccountsManager.credentials.username']);
    }

    public function __destruct()
    {
        $this->ldap->disconnect();
        parent::__destruct();
    }

    /**
     * Return all the accounts the user has access to, formated as a JSON array of objects.
     */
    public function getAll()
    {
        $result = $this->ldap->search(array(
            'filter'        => '(|(objectClass=person)(objectClass=mailRecipient))',
            'basedn'        => $this->userBaseDn,
            'attributes'    => $this->entryAttr,
        ));
        $result->getInnerIterator()->setAttributeNameTreatment(DefaultIterator::ATTRIBUTE_NATIVE);

        $output = array();
        foreach($result as $entry) {
            $output[] = $this->_formatEntryForJson($entry);
        }
        $this->response->write( json_encode($output) );
    }

    /**
     * Return the account specified by the id, formated as a JSON object.
     */
    public function getById($employeeNumber)
    {
        $result = $this->ldap->search(array(
            'filter'        => '(&(|(objectClass=person)(objectClass=mailRecipient))(employeeNumber='.Filter::escapeValue($employeeNumber).'))',
            'basedn'        => $this->userBaseDn,
            'attributes'    => $this->entryAttr,
            'sizelimit'     => 2,
        ));
        $result->getInnerIterator()->setAttributeNameTreatment(DefaultIterator::ATTRIBUTE_NATIVE);

        if( $result->count() < 1 ) {
            throw new UserFriendlyException(404, 'Account not found', 'The account you requested does not exist or you do not have enough rights to access it.');

        } else if( $result->count() > 1 ) {
            throw new UserFriendlyException(500, 'Server error', 'An inconsistency has been detected in the data. Please contact a technician.');
        }

        $this->response->write( json_encode( $this->_formatEntryForJson( $result->getFirst() ) ) );
    }

    private function write($isUpdate = false, $employeeNumber = null)
    {
        // Get the request body (prepared by \Slim\Middleware\ContentTypes)
        $env = $this->app->environment();
        $data = $env['slim.input'];
        if( $data === '{}' ) $data = array();

        // Build the entry
	$entry = $this->formatJsonForEntry($data);
        $entry['objectClass'] = array('person', 'organizationalPerson', 'inetOrgPerson', 'personMailDelivery');
        $entry['employeeNumber'] = ( $isUpdate === false )
            ? $this->ldap->getUUID('employeeNumber')
            : $employeeNumber;

        // Validate the data
        $dn = $this->assertValidEntry($entry, $isUpdate);
        unset($entry['passwordConfirmation']);
        if( isset($entry['userPassword']) ) {
            $entry['userPassword'] = Attribute::createPassword($entry['userPassword'], Attribute::PASSWORD_HASH_SSHA);
        }

        // Adi/Update to LDAP
        if( $isUpdate !== true ) { $this->ldap->add($dn, $entry);    }
        else                     { $this->ldap->update($dn, $entry); }

        // Return the created/updated entry
        $this->getById( $entry['employeeNumber'] );
    }

    public function create()
    {
        $this->write();
    }

    public function update($employeeNumber)
    {
        $this->write(true, $employeeNumber);
    }

    /**
     * Return the account specified by the id, formated as a JSON object.
     */
    public function delete($employeeNumber)
    {
        $result = $this->ldap->search(array(
            'filter'        => '(&(|(objectClass=person)(objectClass=mailRecipient))(employeeNumber='.Filter::escapeValue($employeeNumber).'))',
            'basedn'        => $this->userBaseDn,
            'attributes'    => array('employeeNumber'),
            'sizelimit'     => 2,
        ));
        $result->getInnerIterator()->setAttributeNameTreatment(DefaultIterator::ATTRIBUTE_NATIVE);

        if( $result->count() < 1 ) {
            throw new UserFriendlyException(404, 'Account not found', 'The account you are trying to delete does not exist or you do not have enough rights to access it.');

        } else if( $result->count() > 1 ) {
            throw new UserFriendlyException(500, 'Server error', 'An inconsistency has been detected in the data. Please contact a technician.');
        }

        $dn = $result->dn();
        $this->ldap->delete($dn);
    }

    protected function _formatEntryForJson($entry)
    {
        $arr = array();

        foreach($this->entryAttr as $attrName) {
            if( isset($entry[$attrName]) ) {
                $arr[$attrName] = $entry[$attrName][0];
            }
        }

        // We want to send the complete array, not only the first element
        if( isset($entry['mailAlias']) ) {
            $arr['mailAlias'] = $entry['mailAlias'];
        }

        return $arr;
    }

    protected function formatJsonForEntry($json)
    {
        if( !is_array($json) ) {
            throw new UserFriendlyException(400, 'Incorrect request', 'The data received by the server are incorrect.');
        }

        $arr = array();

        foreach($this->entryAttr as $attrName) {
            $arr[$attrName] = ( isset($json[$attrName]) )
                ? $json[$attrName]
                : null;
        }

        if( isset($json['password']) ) {
            $arr['userPassword'] = $json['password'];
        }
        if( isset($json['passwordConfirmation']) ) {
            $arr['passwordConfirmation'] = $json['passwordConfirmation'];
        }

        return $arr;
    }

    protected function assertValidEntry($entry, $isUpdate = false)
    {
        $domainDn = null;
        $errors = array();

        /*
         * employeeNumber
         */
        if( !preg_match('#^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$#', $entry['employeeNumber']) ) {
            // This is fatal
            if( $isUpdate !== true ) {
                throw new UserFriendlyException(500, 'Server error', 'The server is unable to generate a valid ID for this account. Please contact a technician.');
            } else {
                throw new UserFriendlyException(400, 'Incorrect request', 'The account ID provided with this request is incorrect.');
            }
        }


        /*
         * cn
         */
        if( !isset($entry['cn']) || empty($entry['cn']) ) {
            $errors['cn'] = 'Display name is required.';
        }


        /*
         * givenName
         */
        // Nop


        /* 
         * sn
         */
        if( !isset($entry['sn']) || empty($entry['sn']) ) {
            $errors['sn'] = 'Last name is required.';
        }


        /*
         * mail
         */
        // Validate mail format
        $emailValidator = new EmailAddress();
        if( !isset($entry['mail']) || empty($entry['mail']) ) {
            $errors['mail'] = 'Email is required.';

        } else if( !$emailValidator->isValid($entry['mail']) ) {
            $errors['mail'] = 'The email provided is not correctly formated.';

        } else {
            // Validate mail domain-part is an allowed domain
            $result = $this->ldap->search(array(
                'filter'        => '(|(dc='.Filter::escapeValue($emailValidator->hostname).')(associatedDomain='.Filter::escapeValue($emailValidator->hostname).'))',
                'basedn'        => $this->userBaseDn,
                'attributes'    => array('dc'),
                'sizelimit'     => 2,
            ));

            if( $result->count() < 1 ) {
                $errors['mail'] = array('You are not allowed to create an account for the domain \'%@1\'.', $emailValidator->hostname);

            } else if( $result->count() > 1 ) {
                // This is fatal
                throw new UserFriendlyException(500, 'Server error', 'An inconsistency has been detected in the data. Please contact a technician.');

            } else {
                $domainEntry = $result->getFirst();
                if( $domainEntry['dc'][0] !== $emailValidator->hostname ) {
                    $errors['mail'] = array('\'%@1\' is a domain alias. Please use the primary domain.', $emailValidator->hostname);
                } else {
                    $domainDn = $result->dn();

                    // Validate mail unicity
                    $result = $this->ldap->search(array(
                        'filter'        => '(|(mail='.Filter::escapeValue($entry['mail']).')(mailAlias='.Filter::escapeValue($entry['mail']).'))',
                        'basedn'        => $domainDn,
                        'attributes'    => array('employeeNumber'),
                        'sizelimit'     => 2,
                    ));
                    $result->getInnerIterator()->setAttributeNameTreatment(DefaultIterator::ATTRIBUTE_NATIVE);

                    if( $result->count() === 1 ) {
                        $duplicateEntry = $result->getFirst();
                        if( $isUpdate === false || $entry['employeeNumber'] !== $duplicateEntry['employeeNumber'][0] ) {
                            $errors['mail'] = 'This email address already exists on an other account.';
                        }

                    } else if( $result->count() > 1 ) {
                        // This is fatal
                        throw new UserFriendlyException(500, 'Server error', 'An inconsistency has been detected in the data. Please contact a technician.');
                    }
                }
            }
        }
        

        /*
         * mailAlias
         */
        // Validate each mail aliases
        if( !empty($entry['mailAlias']) && !is_array($entry['mailAlias']) ) {
            $errors['mailAlias'] = 'The data for email aliases are not consistent.';

        } else if( !empty($entry['mailAlias']) ) {
            $errors['mailAlias'] = array();
            $aliasValidator = new EmailAddress();
            foreach($entry['mailAlias'] as $alias) {
                if( !$aliasValidator->isValid($alias) ) {
                    // Validate alias format
                    $errors['mailAlias'][$alias] = 'The email alias provided is not correctly formated.';

                } else if( $emailValidator->hostname !== $aliasValidator->hostname ) {
                    // Validate alias domain-part is the same as mail domain-part
                    $errors['mailAlias'][$alias] = 'The email alias must use the same domain as the email.';

                } else if( $alias === $entry['mail'] ) {
                    // Validate alias unicity with mail
                    $errors['mailAlias'][$alias] = 'The email alias address cannot be the same as the alias must use the same domain as the email.';

                } else {
                    // Validate alias unicity with other entries (including mail)
                    
                }
            }
            if( count($errors['mailAlias']) < 1 ) {
                unset($errors['mailAlias']);
            }
        }

        /*
         * password / passwordConfirmation
         */
        if( isset($entry['userPassword']) && strlen($entry['userPassword']) < 6 ) {
            $errors['password'] = 'Password must be a least 6 characters long.';

        } else if( isset($entry['userPassword']) && isset($entry['userPassword']) !== isset($entry['passwordConfirmation']) ) {
            $errors['passwordConfirmation'] = 'Please re-enter the password to confirm it.';

        } else if( isset($entry['userPassword']) && $entry['userPassword'] !== $entry['passwordConfirmation'] ) {
            $errors['passwordConfirmation'] = 'The confirmation does not match. Please check both password and its confirmation.';
        }


        //
        if( empty($errors) ) {
            return sprintf('employeeNumber=%s,ou=Mailboxes,%s', $entry['employeeNumber'], $domainDn);
        } else {
            $description = ( count($errors) === 1 )
                ? 'There were an error processing your request. Please review the field marked in red.'
                : 'There were errors processing your request. Please review the fields marked in red.';
            throw new UserFriendlyException(400, 'Provided data are incorrect', $description, $errors);
        }
    }
}

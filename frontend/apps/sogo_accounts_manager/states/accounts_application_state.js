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

sc_require('library/somefunc');
sc_require('data_sources/rest_data_source');

SOGoAccountsManager.AccountsApplicationState = SC.State.design({
    initialSubstate: 'loadDataState',

    enterState: function() {
        setActive('mainPage.mainPane.moduleSwitcher.accountsButton');
        SOGoAccountsManager.getPath('mainPage.mainPane.moduleZone').set('nowShowing', SOGoAccountsManager.getPath('accountsApplicationPage.mainView'));
    },

    exitState: function() {
        SOGoAccountsManager.getPath('mainPage.mainPane.moduleZone').set('nowShowing', null);
        unsetActive('mainPage.mainPane.moduleSwitcher.accountsButton');
    },

    loadDataState: SC.State.design({
        initialSubstate: 'loadingDataState',

        enterState: function(context) {
            // Display a 'loading' indicator
            SOGoAccountsManager.getPath('accountsApplicationPage.mainView.busyIndicator').set('isVisible', YES);
        },

        exitState: function() {
            // Hide the 'loading' indicator
            SOGoAccountsManager.getPath('accountsApplicationPage.mainView.busyIndicator').set('isVisible', NO);
        },

        loadingDataState: SC.State.design({
            enterState: function(context) {
                console.debug('SOGoAccountsManager.AccountsApplicationState.loadDataState.loadingDataState.enterState(): enter');

                // Query the store
                if( SOGoAccountsManager.accountsController.get('content') === null ) {
                    console.debug('SOGoAccountsManager.AccountsApplicationState.loadDataState.loadingDataState.enterState(): getting data for the first time');

                    result = SOGoAccountsManager.store.find(SOGoAccountsManager.Account.QUERY);
                    SOGoAccountsManager.accountsController.set('content', result);

                } else /*if( context && context.refresh )*/ {
                    console.debug('SOGoAccountsManager.AccountsApplicationState.loadDataState.loadingDataState.enterState(): refreshing data');

                    accountsStoreKeys = SOGoAccountsManager.store.storeKeysFor(SOGoAccountsManager.Account);
                    SOGoAccountsManager.store.unloadRecords(null, null, accountsStoreKeys);
                    SOGoAccountsManager.accountsController.get('content').refresh();
                }

                console.debug('SOGoAccountsManager.AccountsApplicationState.loadDataState.loadingDataState.enterState(): exit');
            },

            statusDidChange: function(target, key) {
                console.debug('SOGoAccountsManager.AccountsApplicationState.loadDataState.statusDidChange(): enter');

                var status = target.get(key);
                console.debug('SOGoAccountsManager.AccountsApplicationState.loadDataState.statusDidChange(): status=%d', status);

                if( status & SC.Record.BUSY ) {
                    // Nop

                } else if( status & SC.Record.READY ) {
                    this.gotoState('readyState');

                } else if( status & SC.Record.ERROR ) {
                    this.gotoState('errorLoadingState');
                }

                console.debug('SOGoAccountsManager.AccountsApplicationState.loadDataState.statusDidChange(): exit');
            }.stateObserves('SOGoAccountsManager.accountsController.status'),
        }),

        errorLoadingState: SC.State.design({
            enterState: function(context) {
                var response = SOGoAccountsManager.store.readQueryError(SOGoAccountsManager.Account.QUERY);
                var xhr = response.rawRequest;
                var errors = response.get('body');

                if( !errors             ) { errors = {};                      }
                if( !errors.message     ) { errors.message = "Unknown error"; }
                if( !errors.description ) { errors.description = '';          }
                if( !errors.args        ) { errors.args = {};                 }

                SC.AlertPane.error({
                    message: errors.message.loc(),
                    description: errors.description.loc(),
                    buttons: [
                        {
                            title: "Close".loc(),
                        }
                    ]
                });
            },
        }),
    }),

    readyState: SC.State.design({
        newAccount: function() {
            this.gotoState('editState');
        },

        editAccount: function() {
            var selection = SOGoAccountsManager.accountsController.get('selection');
            if( selection.length() !== 1 ) {
                description = (selection.length() < 1)
                    ? "You have to select an account for edition.".loc()
                    : "You cannot select more than one account for edition.".loc();
                SC.AlertPane.error({
                    message: "Account properties".loc(),
                    description: description,
                    buttons: [
                        {
                            title: "Close".loc(),
                        }
                    ]
                });
            } else {
                var item = selection.get('firstObject');
                this.gotoState('editState', { item: item.get('id') });
            }
        },

        deleteAccount: function() {
            if( SOGoAccountsManager.accountsController.get('selection').length() < 1 ) {
                SC.AlertPane.error({
                    message: "Accounts deletion".loc(),
                    description: "You must select one or more accounts to delete.".loc(),
                    buttons: [
                        {
                            title: "Close".loc(),
                        }
                    ]
                });
            } else {
                this.gotoState('deleteState');
            }
        },

        reloadList: function() {
            this.gotoState('loadDataState', { refresh: true });
        },
    }),

    editState: SC.State.design({
        initialSubstate: 'editingState',

        enterState: function(context) {
            // Get or create the item to edit
            var editedItem = ( context && context.item )
                ? SOGoAccountsManager.store.find(SOGoAccountsManager.Account, context.item) // Edit
                : SOGoAccountsManager.store.createRecord(SOGoAccountsManager.Account, {});  // Create

            // Bind the editPane to the edited item
            SOGoAccountsManager.accountsController.set('editedItem', editedItem);

            // Display the popup (always on account tab)
            var editPane = SOGoAccountsManager.getPath('accountsApplicationPage.editPane');
            // Be sure Account tab is always the first displayed (even if the pane was closed on an other tab)
            editPane.getPath('contentView.tabs').set('nowShowing', 'SOGoAccountsManager.accountsApplicationPage.editPane.accountTab');
            editPane.append();
        },

        exitState: function() {
            var editPane = SOGoAccountsManager.getPath('accountsApplicationPage.editPane');
            editPane.remove();

            // Reset error display
            SOGoAccountsManager.accountsController.get('editedItem').set('errorMessages', null);

            SOGoAccountsManager.accountsController.set('editedItem', null);
        },

        editingState: SC.State.design({
            save: function() {
                this.gotoState('committingState');
            },

            cancel: function() {
                console.debug('SOGoAccountsManager.AccountsApplicationState.editState.editingState.cancel(): enter');

                var editedItem = SOGoAccountsManager.accountsController.get('editedItem');

                if( editedItem.get('status') === SC.Record.READY_NEW ) {
                    console.debug('SOGoAccountsManager.AccountsApplicationState.editState.editingState.cancel(): READY_NEW -> unloadRecord()');
                    SOGoAccountsManager.store.unloadRecord(null, null, editedItem.storeKey);

                } else if( editedItem.get('status') === SC.Record.READY_DIRTY ) {
                    console.debug('SOGoAccountsManager.AccountsApplicationState.editState.editingState.cancel(): READY_DIRTY -> refreshRecord()');
                    SOGoAccountsManager.store.refreshRecord(null, null, editedItem.storeKey);
                }

                this.gotoState('readyState');
                console.debug('SOGoAccountsManager.AccountsApplicationState.editState.editingState.cancel(): exit');
            },

            addAlias: function() {
                var obj = MutableString.create({ value: '' });

                var editedItem = SOGoAccountsManager.accountsController.get('editedItem');
                editedItem.get('mailAliasController').addObject(obj)
                editedItem.get('mailAliasController').selectObject(obj);
                SOGoAccountsManager.getPath('accountsApplicationPage.editPane.optionsTab.aliases.contentView.aliasesList.contentView').invokeLater('insertNewline');
            },

            removeAlias: function() {
                SOGoAccountsManager.getPath('accountsApplicationPage.editPane.optionsTab.aliases.contentView.aliasesList.contentView').deleteSelection();
            },
        }),

        committingState: SC.State.design({
            enterState: function() {
                console.debug('SOGoAccountsManager.AccountsApplicationState.editState.committingState.enterState(): enter');

                // Display notification
                // TODO

                // Commit to the server
                var editedItem = SOGoAccountsManager.accountsController.get('editedItem');
                console.debug('SOGoAccountsManager.AccountsApplicationState.editState.committingState.enterState(): editedItem.status=%d', editedItem.get('status'));

                if( editedItem.get('status') === SC.Record.READY_CLEAN ) {
                    this.gotoState('readyState');

                } else {
                    SOGoAccountsManager.store.commitRecord(null, null, editedItem.storeKey);
                }
                console.debug('SOGoAccountsManager.AccountsApplicationState.editState.committingState.enterState(): exit');
            },

            statusDidChange: function(target, key) {
                console.debug('SOGoAccountsManager.AccountsApplicationState.editState.committingState.statusDidChange(): enter');

                var status = target.get(key);
                console.debug('SOGoAccountsManager.AccountsApplicationState.editState.committingState.statusDidChange(): status=%d', status);
                if( status & SC.Record.BUSY ) {
                    // Nop

                } else if( status & SC.Record.READY ) {
                    this.gotoState('readyState');

                } else if( status & SC.Record.ERROR ) {
                    this.gotoState('errorCommittingState');
                }

                console.debug('SOGoAccountsManager.AccountsApplicationState.editState.committingState.statusDidChange(): exit');
            }.stateObserves('SOGoAccountsManager.accountsController*editedItem.status'),
        }),

        errorCommittingState: SC.State.design({
            enterState: function(context) {
                var editedItem = SOGoAccountsManager.accountsController.get('editedItem');
                var response = SOGoAccountsManager.store.readError(editedItem.storeKey);
                var xhr = response.rawRequest;
                var errors = response.get('body');

                if( !errors.message     ) { errors.message = "Unknown error"; }
                if( !errors.description ) { errors.description = '';          }
                if( !errors.args )        { errors.args = {};                 }

                SC.AlertPane.error({
                    message: errors.message.loc(),
                    description: errors.description.loc(),
                    buttons: [
                        {
                            title: "Close".loc(),
                        }
                    ]
                });

                var editedItem = SOGoAccountsManager.accountsController.get('editedItem');
                editedItem.set('errorMessages', errors.args);

                var origStatus = ( editedItem.get('id') != null )
                    ? SC.Record.READY_DIRTY
                    : SC.Record.READY_NEW;
                SOGoAccountsManager.store.writeStatus(editedItem.storeKey, origStatus);
                SOGoAccountsManager.store.dataHashDidChange(editedItem.storeKey, null, YES);

                this.gotoState('editingState');
            },
        }),

    }),

    deleteState: SC.State.design({
        enterState: function() {
            SC.AlertPane.warn({
                message: "Delete accounts".loc(),
                description: "Are you sure you want to delete the selected account?".loc(),
                buttons: [
                    {
                        title: "Delete".loc(),
                        action: 'confirmDelete',
                    },
                    {
                        title: "Cancel".loc(),
                        action: 'cancelDelete',
                    }
                ]
            });
        },

        confirmDelete: function() {
            selection = SOGoAccountsManager.accountsController.get('selection');
            selection.forEach( function(object, index, source, indexSet) { object.destroy(); object.commitRecord(); } );

            SOGoAccountsManager.accountsController.set('selection', null);

            this.gotoState('readyState');
        },

        cancelDelete: function() {
            this.gotoState('readyState');
        },
    }),
});

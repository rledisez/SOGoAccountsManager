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

sc_require('mixins/text_field_error');

SOGoAccountsManager.accountsApplicationPage = SC.Page.design({

    mainView: SC.View.design({
        childViews: 'accountsToolbar busyIndicator accountsTable'.w(),

        accountsToolbar: SC.ToolbarView.extend(SC.FlowedLayout, {
            layout: { top: 0, left: 0, right: 0, height: 51 },

            childViews: 'newButton editButton separator1 deleteButton separator2 reloadButton'.w(),
            layoutDirection: SC.LAYOUT_HORIZONTAL,
            align: SC.ALIGN_LEFT,
            defaultFlowSpacing: { top: 1, bottom: 0, left: 0, right: 0 },

            newButton: SC.ButtonView.design(SC.AutoResize, {
                flowSpacing: { top: 1, left: 1 },
                layout: { height: 49 },
                icon: static_url('images/toolbar/newAccount.png'),
                title: "New account".loc(),
                action: 'newAccount',
            }),

            editButton: SC.ButtonView.design(SC.AutoResize, {
                layout: { height: 49 },
                icon: static_url('images/toolbar/editAccount.png'),
                title: "Properties".loc(),
                action: 'editAccount',
            }),

            separator1: SC.SeparatorView.design({
                layout: { height: 49, width: 10 },
                layoutDirection: SC.LAYOUT_VERTICAL,
            }),

            deleteButton: SC.ButtonView.design(SC.AutoResize, {
                layout: { height: 49 },
                icon: static_url('images/toolbar/deleteAccount.png'),
                title: "Delete".loc(),
                action: 'deleteAccount',
            }),

            separator2: SC.SeparatorView.design({
                layout: { height: 49, width: 10 },
                layoutDirection: SC.LAYOUT_VERTICAL,
            }),

            reloadButton: SC.ButtonView.design(SC.AutoResize, {
                layout: { height: 49 },
                icon: static_url('images/toolbar/reloadList.png'),
                title: "Reload".loc(),
                action: 'reloadList',
            }),
        }),

        busyIndicator: SC.ImageView.extend({
            layout: { top: 17, right: 17, height: 16, width: 16 },
            value: static_url('images/toolbar/busy.gif'),
            useCanvas: NO,
            isVisible: NO,
        }),

        accountsTable: SCTable.TableView.design({
            layout: { top: 52, bottom: 0, left: 0, right: 0 },
            headerHeight: 22,
            rowHeight: 20,
            canReorderColumns: NO,

            columns: [
                SC.Object.create(SCTable.Column, {
                    name: "Name".loc(),
                    valueKey: 'displayName',
                    width: 0.5,
                    canResize: YES,
                    canSort: YES,
                }),
                SC.Object.create(SCTable.Column, {
                    name: "Email".loc(),
                    valueKey: 'mail',
                    width: 0.5,
                    canResize: YES,
                    canSort: YES,
                }),
            ],

            contentBinding: 'SOGoAccountsManager.accountsController.arrangedObjects',
            selectionBinding: 'SOGoAccountsManager.accountsController.selection',

            action: 'editAccount',
        }),

    }), /* mainView */

    editPane: SC.PanelPane.create({
        layout: { centerY: 0, centerX: 0, height: 530, width: 450 },

        contentView: SC.View.design({
            childViews: 'tabs buttons'.w(),

            tabs: SC.TabView.design({
                layout: { top: 5, bottom: 34, left: 5, right: 5 },

                nowShowing: null,
                itemTitleKey: 'title',
                itemValueKey: 'value',

                items: [
                    { title: "Account".loc(), value: 'SOGoAccountsManager.accountsApplicationPage.editPane.accountTab' },
                    { title: "Options".loc(), value: 'SOGoAccountsManager.accountsApplicationPage.editPane.optionsTab' },
                    { title: "Contact".loc(), value: 'SOGoAccountsManager.accountsApplicationPage.editPane.contactTab' },
                ],
            }),

            buttons: SC.View.design(SC.FlowedLayout, {
                layout: { bottom: 5, left: 0, right: 12, height: 24 },

                childViews: 'cancelButton saveButton'.w(),
                layoutDirection: SC.LAYOUT_HORIZONTAL,
                align: SC.ALIGN_RIGHT,
                defaultFlowSpacing: { top: 0, bottom: 0, left: 5, right: 0 },

                saveButton: SC.ButtonView.design(SC.AutoResize, {
                    classNames: ['no-padding'],
                    title: "Save".loc(),
                    action: 'save',
                    isSelected: YES,
                    isDefault: YES,
                }),

                cancelButton: SC.ButtonView.design(SC.AutoResize, {
                    classNames: ['no-padding'],
                    title: "Cancel".loc(),
                    action: 'cancel',
                    isCancel: YES,
                }),
            }),

        }), /* contentView */

        accountTab: SC.View.create(SC.FlowedLayout, {
            childViews: 'accountLabel account identityLabel identity'.w(),
            layoutDirection: SC.LAYOUT_VERTICAL,
            defaultFlowSpacing: { top: 10, bottom: 0, left: 5, right: 0 },

            accountLabel: SC.LabelView.design(SC.AutoResize, {
                flowSpacing: { top: 10, bottom: -16, left: 15 },
                layout: { height: 16 },
                classNames: ['text-align-center', 'well-label'],
                value: "Account".loc(),
            }),

            account: SC.WellView.design(SC.FlowedLayout, {
                layout: { right: 2 },

                layoutDirection: SC.LAYOUT_VERTICAL,
                defaultFlowSpacing: { top: 10, bottom: 10, left: 10, right: 10 },

                contentView: SC.View.create(SC.FlowedLayout, {
                    childViews: 'email password passwordConfirmation'.w(),
                    layoutDirection: SC.LAYOUT_VERTICAL,
                    defaultFlowSpacing: { top: 1, bottom: 1, left: 0, right: 0 },

                    email: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Email:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.mail',
                        }),
                    }),

                    password: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Password:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.password',
                            type: 'password',
                        }),
                    }),

                    passwordConfirmation: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Confirmation:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.passwordConfirmation',
                            type: 'password',
                        }),
                    }),
                }),
            }),

            identityLabel: SC.LabelView.design(SC.AutoResize, {
                flowSpacing: { top: 10, bottom: -16, left: 15 },
                layout: { height: 16 },
                classNames: ['text-align-center', 'well-label'],
                value: "Identity".loc(),
            }),

            identity: SC.WellView.design(SC.FlowedLayout, {
                layout: { right: 2 },

                layoutDirection: SC.LAYOUT_VERTICAL,
                defaultFlowSpacing: { top: 10, bottom: 10, left: 10, right: 10 },

                contentView: SC.View.create(SC.FlowedLayout, {
                    childViews: 'firstName lastName displayName'.w(),
                    layoutDirection: SC.LAYOUT_VERTICAL,
                    defaultFlowSpacing: { top: 1, bottom: 1, left: 0, right: 0 },

                    firstName: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "First name:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.firstName',
                        }),
                    }),

                    lastName: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Last name:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.lastName',
                        }),
                    }),

                    displayName: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Display name:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.displayName',
                        }),
                    }),
                }),
            }),

        }), /* accountTab */

        optionsTab: SC.View.create(SC.FlowedLayout, {
            childViews: 'generalLabel general aliasesLabel aliases quotasLabel quotas'.w(),
            layoutDirection: SC.LAYOUT_VERTICAL,
            defaultFlowSpacing: { top: 10, bottom: 0, left: 5, right: 0 },

            generalLabel: SC.LabelView.design(SC.AutoResize, {
                flowSpacing: { top: 10, bottom: -16, left: 15 },
                layout: { height: 16 },
                classNames: ['text-align-center', 'well-label'],
                value: "General".loc(),
            }),

            general: SC.WellView.design({
                layout: { right: 12, height: 90 },

                // height = $height - 22px
                contentView: SC.View.create({
                    childViews: 'transportLabel transportField'.w(),

                    transportLabel: SC.LabelView.design({
                        layout: { top: 2, left: 0, right: 255, height: 18 },
                        isVisible: NO,
                        classNames: ['text-align-right'],
                        value: "Delivery:".loc(),
                    }),
                    transportField: SC.SelectView.design({
                        layout: { top: 2, right: 2, height: 18, width: 249 },
                        isVisible: NO,
                        valueBinding: 'SOGoAccountsManager.accountsController*editedItem.transport',
                        itemTitleKey: 'title',
                        itemValueKey: 'value',

                        items: [
                            { title: "Default for the domain (Mailbox)".loc(), value: null, },
                            { title: "Mailbox".loc(), value: 'virtual:',  },
                            { title: "Relay".loc(), value: 'smtp:',  },
                            { title: "Discard".loc(), value: 'discard:',  },
                            { title: "Reject".loc(), value: 'error:',  },
                        ]
                    }),
                }),
            }),

            aliasesLabel: SC.LabelView.design(SC.AutoResize, {
                flowSpacing: { top: 10, bottom: -16, left: 15 },
                layout: { height: 16 },
                classNames: ['text-align-center', 'well-label'],
                value: "Aliases".loc(),
            }),

            aliases: SC.WellView.design({
                layout: { right: 12, height: 145 },

                // height = $height - 22px
                contentView: SC.View.create({
                    childViews: 'aliasesList aliasesToolbar'.w(),
                    classNames: ['mailAlias'],

                    aliasesList: SC.ScrollView.design({
                        layout: { top: 0, bottom: 21, left: 0, right: 0 },
                        themeName: 'ace',

                        contentView: SC.ListView.design(SOGoAccountsManager.ListViewError, {
                            themeName: 'sogo_accounts_manager', // Do not propagate ScrollView theme
                            contentBinding: 'SOGoAccountsManager.accountsController*editedItem.mailAliasController.arrangedObjects',
                            selectionBinding: 'SOGoAccountsManager.accountsController*editedItem.mailAliasController.selection',
                            contentValueKey: 'value',
                            exampleView: SOGoAccountsManager.ListItemErrorView,
                            rowHeight: 20,
                            isEditable: YES,
                            canEditContent: YES,
                            canReorderContent: NO,
                            canDeleteContent: YES,
                        }),
                    }),
                    aliasesToolbar: SC.View.design({
                        layout: { bottom: 0, left: 0, right: 0, height: 20 },
                        classNames: ['list-toolbar'],
                        childViews: 'add remove'.w(),

                        add: SC.ImageButtonView.design({
                            layout: { top: 0, left: 0, height: 20, width: 24 },
                            image: 'list-toolbar-add',
                            toolTip: "Add a mail alias".loc(),
                            action: 'addAlias',
                        }),
                        remove: SC.ImageButtonView.design({
                            layout: { top: 0, left: 25, height: 20, width: 24 },
                            image: 'list-toolbar-remove',
                            toolTip: "Remove a mail alias".loc(),
                            action: 'removeAlias',
                        }),
                    }),
                }),
            }),

            quotasLabel: SC.LabelView.design(SC.AutoResize, {
                flowSpacing: { top: 10, bottom: -16, left: 15 },
                layout: { height: 16 },
                classNames: ['text-align-center', 'well-label'],
                value: "Quotas".loc(),
            }),

            quotas: SC.WellView.design({
                layout: { right: 12, height: 90 },

                // height = $height - 22px
                contentView: SC.View.create({
                    childViews: ''.w(),
                }),
            }),

        }), /* optionsTab */

        contactTab: SC.View.create(SC.FlowedLayout, {
            childViews: 'addressLabel address phonesLabel phones'.w(),
            layoutDirection: SC.LAYOUT_VERTICAL,
            defaultFlowSpacing: { top: 10, bottom: 0, left: 5, right: 0 },

            addressLabel: SC.LabelView.design(SC.AutoResize, {
                flowSpacing: { top: 10, bottom: -16, left: 15 },
                layout: { height: 16 },
                classNames: ['text-align-center', 'well-label'],
                value: "Address".loc(),
            }),

            address: SC.WellView.design(SC.FlowedLayout, {
                layout: { right: 2 },

                layoutDirection: SC.LAYOUT_VERTICAL,
                defaultFlowSpacing: { top: 10, bottom: 10, left: 10, right: 10 },

                contentView: SC.View.create(SC.FlowedLayout, {
                    childViews: 'title department organization address city state postalCode'.w(),
                    layoutDirection: SC.LAYOUT_VERTICAL,
                    defaultFlowSpacing: { top: 1, bottom: 1, left: 0, right: 0 },

                    title: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Title:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.title',
                        }),
                    }),

                    department: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Department:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.department',
                        }),
                    }),

                    organization: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Organization:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.organization',
                        }),
                    }),

                    address: SC.View.create({
                        layout: { height: 42 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Address:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 36 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.address',
                            isTextArea: YES,
                        }),
                    }),


                    city: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "City:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.city',
                        }),
                    }),


                    state: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "State:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.state',
                        }),
                    }),


                    postalCode: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Postal Code:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.postalCode',
                        }),
                    }),


                    /*country: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Country:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.mail',
                        }),
                    }),*/


                    /*webpage: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Web page:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.mail',
                        }),
                    }),*/

                }),
            }),

            phonesLabel: SC.LabelView.design(SC.AutoResize, {
                flowSpacing: { top: 10, bottom: -16, left: 15 },
                layout: { height: 16 },
                classNames: ['text-align-center', 'well-label'],
                value: "Phones".loc(),
            }),

            phones: SC.WellView.design(SC.FlowedLayout, {
                layout: { right: 2 },

                layoutDirection: SC.LAYOUT_VERTICAL,
                defaultFlowSpacing: { top: 10, bottom: 10, left: 10, right: 10 },

                contentView: SC.View.create(SC.FlowedLayout, {
                    childViews: 'work home mobile fax pager'.w(),
                    layoutDirection: SC.LAYOUT_VERTICAL,
                    defaultFlowSpacing: { top: 1, bottom: 1, left: 0, right: 0 },

                    work: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Work:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.workPhone',
                        }),
                    }),

                    home: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Home:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.homePhone',
                        }),
                    }),

                    mobile: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Mobile:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.mobile',
                        }),
                    }),

                    fax: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Fax:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.fax',
                        }),
                    }),

                    pager: SC.View.create({
                        layout: { height: 22 },
                        childViews: 'label field'.w(),

                        label: SC.LabelView.design({
                            layout: { top: 2, left: 0, height: 18, width: 149 },
                            classNames: ['text-align-right'],
                            value: "Pager:".loc(),
                        }),
                        field: SC.TextFieldView.design(SOGoAccountsManager.TextFieldError, {
                            layout: { top: 2, left: 153, right: 2, height: 18 },
                            valueBinding: 'SOGoAccountsManager.accountsController*editedItem.pager',
                        }),
                    }),
                }),
            }),

        }), /* contactTab */

    }), /* editPane */

});

app.controller('kendoCtrl', function ($scope, $requestFactory) {



    var statusDropDown = function (container, options) {

        $('<input data-text-field="name" data-value-field="value" data-bind="value:' + options.field + '"/>')

            .appendTo(container)

            .kendoDropDownList({

                autoBind: false,

                dataSource: {

                    data: [{name: "Select Status", value: ""}, {name: "Yes", value: "Y"}, {name: "No", value: "N"}]

                }

            });

    };





    $scope.mainGridOptions = {};

    $scope.checked = [];

    var hitech = new Hitech({

        scope: $scope,

        grid: $scope.mainGridOptions,

        http: $requestFactory

    })



    $scope.updateFilteredList = function (query) {
        var selecteditem = query;
        var kgrid = $("#mainGridOptions").data("kendoGrid");
        selecteditem = selecteditem.toUpperCase();
        var selectedArray = selecteditem.split(" ");
        if (selecteditem) {
            //kgrid.dataSource.filter({ field: "UserName", operator: "eq", value: selecteditem });
            var orfilter = { logic: "or", filters: [] };
            var andfilter = { logic: "and", filters: [] };
            $.each(selectedArray, function (i, v) {
                if (v.trim() == "") {
                }
                else {
                    $.each(selectedArray, function (i, v1) {
                        if (v1.trim() == "") {
                        }
                        else {
                            orfilter.filters.push({ field: "id", operator: "contains", value:v1},
                                                    { field: "name", operator: "contains", value:v1});
                            andfilter.filters.push(orfilter);
                            orfilter = { logic: "or", filters: [] };
                        }

                    });
                }
            });
            kgrid.dataSource.filter(andfilter);
        }
        else {
            kgrid.dataSource.filter({});
        }
    }



    $scope.adjustPageSize = function (size) {

        hitech.pageSize(size);

    }



    $scope.deleteSelected = function () {

        var ids = hitech.prepareDelete();

        if (ids.length > 0) {

            if (confirm("Are you sure you want to delete " + ids.length + " compatibles devices?") === false) {

                return;

            }



            hitech.request({

                sub: 'api/api/rest',

                query: {

                    apikey: apikey,

                    table: 'compatibles',

                    action: 'delete',

                    model: {

                        where_in: {

                            sn: ids

                        }

                    }

                },

                method: 'POST',

                complete: function (result) {

                    if (result.code == 200) {

                        hitech.scope.checked = [];

                        hitech.omitSelected(ids);

                        $.notify("Selected compatibles were deleted successfully.", {

                            className: 'success',

                            autoHideDelay: '10000'

                        });

                    } else {

                        $.notify("Selected compatibles could not be deleted.", {

                            className: 'error',

                            autoHideDelay: '10000'

                        });

                    }

                }

            });

        } else {

            $.notify("Please select at least one device.", {

                className: 'info',

                autoHideDelay: '10000'

            });

        }

    }



    $scope.resetSelected = function () {

        hitech.clearFilters();

        hitech.request({

            first: {

                sub: 'api/api/rest',

                query: {

                    apikey: apikey,

                    table: 'keep_omit',

                    model: {

                        where: {

                            identify: 'CB',

                            userSN: {method: 'getVar|_userSN'}

                        }

                    },

                    action: "delete"

                },

                method: 'POST',

                complete: function (result) {

                    if (result.code === 200) {

                        $.notify("Compatibles have been reset successfully.", {

                            className: 'success',

                            autoHideDelay: '10000'

                        });

                        hitech.request({

                            sub: 'api/api/rest',

                            method: "POST",

                            query: {

                                apikey: apikey,

                                table: 'compatibles',

                                model: {

                                    where: {

                                        adminSN: {method: 'getVar|_userSN'}

                                    }

                                }

                            },

                            complete: function (res) {

                                if (res != false) {

                                    $scope.mainGridOptions.dataSource.data(res.result);

                                    $.notify("Compatibles have been reloaded.", {

                                        className: 'success',

                                        autoHideDelay: '10000'

                                    });

                                } else {

                                    $.notify("Compatibles could not be reloaded.", {

                                        className: 'error',

                                        autoHideDelay: '10000'

                                    });

                                }

                            }

                        });

                    } else {

                        $.notify("Compatibles could not be reset.", {

                            className: 'error',

                            autoHideDelay: '10000'

                        });

                    }

                }

            }

        });

    }



    $scope.updateGridBySelection = function (selection) {

        var res = hitech.updateGridBySelection(selection);

        if (res === false) {

            return;

        }

        hitech.request({

            sub: 'api/api/rest',

            method: "POST",

            query: {

                apikey: apikey,

                method: 'selection',

                flag: selection.split(' ')[0].toLowerCase(),

                id: res,

                type: 'CB'

            },

            complete: function (result) {

                $.notify(result.response, result.status == 200 ? 'success' : 'error');

            }

        });

    }



    var dataSource = new kendo.data.DataSource({

        transport: {

            read: {



                url: base + 'api/customers/compatibles?apikey=' + apikey,

                dataType: "json"

            },

            update: {

                url: base + 'api/customers/compatibles',

                type: "POST",

                dataType: "json"

            },

            destroy: {

                url: base + 'api/customers/deleteCompatibles',

                type: "POST",

                dataType: "json"

            },

            create: {

                url: base + 'api/customers/compatibles',

                type: "POST",

                dataType: "json"

            },

            parameterMap: function (options, operation) {

                if (operation !== "read") {

                    if (options.models.length > 0) {

                        return {models: (options.models), apikey: apikey};

                    } else {

                        return {models: (options), apikey: apikey};

                    }



                }

            }

        },



        pageSize: 20,

        batch: true,

        schema: {

            model: {

                id: "id",

                fields: {

                    name: {validation: {required: true}, editable: true},

                    status: {type: "string", editable: true},

                    dateCreated: {editable: false}

                }

            }

        },



        pageable: true

    });



    $scope.mainGridOptions = {

        dataSource: dataSource,

        sortable: true,
        pageable: true,
        toolbar: [

            "create",

            {

                template: '<a href="javascript:;" ng-click="deleteSelected()" class="k-button k-button-icontext k-grid-delete"><span class="k-icon k-delete"></span>Delete selected</a>'

            },

            {

                template: '<a href="javascript:;" ng-click="resetSelected()" class="k-button k-button-icontext k-grid-reset"><span class="k-icon k-reset"></span>Reset</a>'

            }

        ],

        editable: "popup",

        selectable: "multiple",

        columns: [{

            width: 35,

            template: "<input type='checkbox' class='checkbox' />"

        },

            {

                field: "id",

                title: "Id",

            }, {

                field: "name",

                title: "Name",

            }, {

                field: "status",

                title: "Status",

                template: function (data) {

                    if (data.status == "Y") {

                        return "<span class='glyphicon glyphicon-ok'></span>";

                    } else {

                        return "<span class='glyphicon glyphicon-remove'></span>";

                    }

                },

                editor: statusDropDown



            }, {

                field: "createdDate",

                title: "Date Created"

            },{

                command: ["edit", "destroy"], title: "&nbsp;", width: "250px"

            }],

        dataBound: function () {
            hitech.gridDataBound('checkbox');
            // for showing total count of data in top of grid
            var grid = $("#mainGridOptions").data("kendoGrid"),
                topPagination = $('#topPageCount');

            if (topPagination.length==0) {
                var wrapper = $('<div class="k-pager-wrap k-grid-pager pagerTop" id="topPageCount"/>').insertBefore(grid.element.children(".k-grid-header"));
                grid.pagerTop = new kendo.ui.Pager(wrapper, $.extend({}, grid.options.pageable, { dataSource: grid.dataSource }));
                grid.element.height("").find(".pagerTop").css("border-width", "0 0 1px 0");
            };
        },

        edit: function (e) {

            $('label[for=id]').parent().remove();

            e.container.find(".k-edit-field:first").hide();

            e.container.find(".k-edit-field:first+").hide();



            $('label[for=modifiedDate]').parent().remove();

            e.container.find(".k-edit-field:last").hide();



            $('label[for=createdDate]').parent().remove();

            e.container.find(".k-edit-field:first++++++++++++").hide();

        },

        change: function (e) {

            hitech.gridChangeEvent(this, e);

        }

    };



});



$('body #checkAll').on('click', '.grid .k-header', function (e) {

    //debugger;

    //write your logic..

});
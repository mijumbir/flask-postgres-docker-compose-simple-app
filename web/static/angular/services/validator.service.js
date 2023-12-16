app.service('validatorService', function() {

    //------------------------------------------------------------------------//
    // Returns true if is input is valid date.
    this.validateDate = function(date) {

        // Check none of the fields are empty
        if (this.isEmpty(date.day) || this.isEmpty(date.month) || this.isEmpty(date.year)) {
            return false;
        }

        else {
            // Get int values
            var day_int = parseInt(date.day);
            var month_int = parseInt(date.month);
            var year_int = parseInt(date.year);

            // Check month is valid
            if (month_int > 12 || month_int < 1) {
                return false;
            }

            else {
                // Get month lengths
                var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

                // Adjust for leap years
                if(year_int % 400 == 0 || (year_int % 100 != 0 && year_int % 4 == 0))
                    monthLength[1] = 29;

                // Check the range of the day
                return day_int >= 1 && day_int <= monthLength[month_int - 1];
            }
        }
    }


    //------------------------------------------------------------------------//
    // Returns true if dateA is earlier than dateB, of if dateA and dateB are the same.
    this.compareDates = function(dateA, dateB) {

        // Format dates
        var formattedA = new Date(dateA.year, dateA.month, dateA.day).getTime();
        var formattedB = new Date(dateB.year, dateB.month, dateB.day).getTime();

        return formattedA <= formattedB;
    }


    //------------------------------------------------------------------------//
    // returns true if input is valid number
    this.validateNumber = function(input) {
        return !(this.isEmpty(input) || isNaN(input));
    }


    //------------------------------------------------------------------------//
    // Returns true is string is empty or undefined.
    this.isEmpty = function(value) {
        return value === '' || value === undefined || value === null;
    }

});
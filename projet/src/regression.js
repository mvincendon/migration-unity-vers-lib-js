function leastSquares(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    if (values_length > 1 && min(values_x) === max(values_x)) { // Cas d'une droite verticale, normalement ça n'arrive jamais mais au cas où
        // Il faut déterminer si elle va vers le haut ou le bas
        const fact = Math.sign(values_y[values_y.length-1] - values_y[0]);
        return [0, fact * 10000];
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;

    /*
     * We will make the x and y result line now
     */
    var result_values_x = [];
    var result_values_y = [];

    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    // return [result_values_x, result_values_y];
    const fact = Math.sign(values_x[values_x.length-1] - values_x[0]);
    return [fact, fact*m];
}

function max(array){
    let maxi = array[0];
    for (const el of array){
        if (el > maxi)
            maxi = el;
    }
    return maxi
}
function min(array){
    let mini = array[0];
    for (const el of array){
        if (el < mini)
            mini = el;
    }
    return mini
}

export {leastSquares};
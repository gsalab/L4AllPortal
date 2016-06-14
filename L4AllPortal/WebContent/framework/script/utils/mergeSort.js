/*IMPLEMENTAZIONE DEL MARGE SORT PER GLI ELEMENTI DI UN ARRAY*/

var defaultComparator = function (a, b) {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      }
      
Array.prototype.mergeSort = function( comparator ) {
    var i, j, k,
        firstHalf,
        secondHalf,
        arr1,
        arr2;

    if (typeof comparator != "function") { comparator = defaultComparator; }

    if (this.length > 1) {
      firstHalf = Math.floor(this.length / 2);
      secondHalf = this.length - firstHalf;
      arr1 = [];
      arr2 = [];

      for (i = 0; i < firstHalf; i++) {
        arr1[i] = this[i];
      }

      for(i = firstHalf; i < firstHalf + secondHalf; i++) {
        arr2[i - firstHalf] = this[i];
      }

      arr1.mergeSort( comparator );
      arr2.mergeSort( comparator );

      i=j=k=0;

      while(arr1.length != j && arr2.length != k) {
        if ( comparator( arr1[j], arr2[k] ) <= 0 ) {
          this[i] = arr1[j];
          i++;
          j++;
        } 
        else {
          this[i] = arr2[k];
          i++;
          k++;
        }
      }

      while (arr1.length != j) {
        this[i] = arr1[j];
        i++;
        j++;
      }

      while (arr2.length != k) {
        this[i] = arr2[k];
        i++;
        k++;
      }
    }
}
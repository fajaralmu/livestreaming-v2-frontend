
export const groupArray = function (array, division) {
    if (null == array || array.length == 0) { return [] }
    const groupedArray = new Array();
    const itemPerDivision = Math.ceil(array.length / division)

    if (itemPerDivision == 1) {
        groupedArray.push(array);
        return groupedArray;
    }

    for (let i = 0; i < division; i++) {
        groupedArray.push(new Array());
    }

    let index = 1;
    let divisionIndex = 0;
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        groupedArray[divisionIndex].push(element);

        index++;
        if (index > itemPerDivision) {
            divisionIndex++;
            index = 1;
        }
    }

    return groupedArray;
}

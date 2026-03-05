export function arrayToMap(arr) {
  const map = {};
  arr.forEach(item => {
    map[item] = 1;
  });
  return map;
}

export function mergeMap(map1, map2) {
  const map = {};
  for (const key in map1) {
    map[key] = map1[key];
  }
  for (const key in map2) {
    map[key] = (map[key] ?? 0) + map2[key];
  }
  return map;
}

export function compareMap(map1, map2) {
  const inMap1ButNotInMap2 = [];
  for (const key in map1) {
    if (!map2[key]) {
      // console.log(`Key "${key}" is missing in map2`);
      inMap1ButNotInMap2.push(key);
    }
  }
  inMap1ButNotInMap2.sort((a, b) => a.localeCompare(b));
  if (inMap1ButNotInMap2.length > 0) {
    console.log('inMap1ButNotInMap2', inMap1ButNotInMap2.length, inMap1ButNotInMap2.join(','));
  }
  const inMap2ButNotInMap1 = [];
  for (const key in map2) {
    if (!map1[key]) {
      // console.log(`Key "${key}" is missing in map1`);
      inMap2ButNotInMap1.push(key);
    }
  }
  inMap2ButNotInMap1.sort((a, b) => a.localeCompare(b));
  if (inMap2ButNotInMap1.length > 0) {
    console.log('inMap2ButNotInMap1', inMap2ButNotInMap1.length, inMap2ButNotInMap1.join(','));
  }
}

export function ensureNoSameKey(map1, map2) {
  for (const key in map1) {
    if (map2[key]) {
      throw Error(`Same key ${key} in map1 and map2`);
    }
  }
}

export function inArrayAButNotInB(arrA, arrB) {
  const mapA = arrayToMap(arrA);
  const mapB = arrayToMap(arrB);
  const res = [];
  for (const key in mapA) {
    if (!mapB[key]) {
      res.push(key);
    }
  }
  return res;
}


export function stringifyJSON1level(obj) {
  function formatValue(value) {
    if (Array.isArray(value)) {
      // Stringify the array and add spaces after commas (outside strings)
      let str = JSON.stringify(value);
      let result = '';
      let inString = false;
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"' && (i === 0 || str[i - 1] !== '\\')) {
          inString = !inString; // Toggle string state
        }
        if (char === ',' && !inString) {
          result += ', '; // Add space after commas not in strings
        } else {
          result += char;
        }
      }
      return result;
    }
    // Non-arrays: use regular JSON stringify
    return JSON.stringify(value);
  }

  const entries = Object.entries(obj);
  const formattedEntries = entries.map(([key, value]) =>
    `  "${key}": ${formatValue(value)}`
  );
  return `{\n${formattedEntries.join(',\n')}\n}`;
}

export function stringifyArray1level(arr) {
  let str = '[\n';
  str += arr.map(cats => `  ${JSON.stringify(cats)}`).join(',\n');
  str += '\n]';
  return str;
}

export function removeBracketedContent(str, open = '(', close = ')') {
  let depth = 0;
  let result = [];

  for (let char of str) {
    if (char === open) {
      depth++;
    } else if (char === close && depth > 0) {
      depth--;
    } else if (depth === 0) {
      result.push(char);
    }
  }

  return result.join('');
}

export function arrayIsAscending(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) {
      throw new Error(`Error: Array is not ascending at index ${i}`);
    }
  }
  return true;
}


export function batchArray(arr, count) {
  const batchSize = Math.ceil(arr.length / count);
  const res = [];
  for (let i = 0; i < count; i++) {
    const batchArr = arr.slice(i * batchSize, (i + 1) * batchSize);
    res.push(batchArr);
  }
  return res;
}

export function batchArray2(arr, len) {
  const res = [];
  for (let i = 0; i < arr.length; i += len) {
    const batchArr = arr.slice(i, i + len);
    res.push(batchArr);
  }
  return res;
}

export function formatString(str, placeholderMap) {
  const res = str.replace(/{{(\w+)}}/g, (match, key) => {
    const content = placeholderMap[key]
    if (!content) {
      throw new Error(`placeholderMap 中没有 ${key} 这个 key`)
    }
    return content
  })
  return res;
}


export function reverseMap(map) {
  const res = {};
  for (const key in map) {
    if (res[map[key]]) {
      throw new Error(`map 中 ${map[key]} 这个 value 重复了`)
    }
    res[map[key]] = key;
  }
  return res;
}

export function mergeMapsToDataArray(maps, keyNames) {
  const firstMap = maps[0];
  for (let i = 1; i < maps.length; i++) {
    compareMap(firstMap, maps[i]);
  }
  const res = [];
  for (const key in firstMap) {
    const item = {};
    item[keyNames[0]] = key;
    item[keyNames[1]] = firstMap[key];
    for (let i = 1; i < maps.length; i++) {
      const value = maps[i][key];
      if (value === undefined) {
        throw new Error(`Key "${key}" is missing in map index ${i}`);
      }
      item[keyNames[i + 1]] = value;
    }
    res.push(item);
  }
  return res;
}


export function mapFilterKeys(map, keys){
  const res = {};
  for(const key in map){
    if(keys.includes(key)){
      res[key] = map[key];
    }
  }
  return res;
}
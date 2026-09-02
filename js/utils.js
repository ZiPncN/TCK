const TCKUtil = {
  /**
   * 深度比较两个值内容是否相等
   * @param {any} o1
   * @param {any} o2
   * @param {WeakSet} [visited] 循环引用标记，内部递归使用
   * @returns {boolean}
   */
  isDeepEqual(o1, o2, visited = new WeakSet()) {
    // 基础严格相等
    if (o1 === o2) return true;

    // null / undefined 拦截
    if (o1 == null || o2 == null) return false;

    // 非对象类型，上面已经 === 判断过，直接不等
    if (typeof o1 !== 'object' || typeof o2 !== 'object') return false;

    // 处理循环引用
    if (visited.has(o1) || visited.has(o2)) return true;
    visited.add(o1);
    visited.add(o2);

    // 区分数组、普通对象
    const isArr1 = Array.isArray(o1);
    const isArr2 = Array.isArray(o2);
    if (isArr1 !== isArr2) return false;

    // Date
    if (o1 instanceof Date && o2 instanceof Date) {
      return o1.getTime() === o2.getTime();
    }
    // RegExp
    if (o1 instanceof RegExp && o2 instanceof RegExp) {
      return (
        o1.source === o2.source &&
        o1.flags === o2.flags &&
        o1.global === o2.global &&
        o1.ignoreCase === o2.ignoreCase &&
        o1.multiline === o2.multiline
      );
    }

    // 获取自身全部key（包含Symbol）
    const keys1 = Reflect.ownKeys(o1);
    const keys2 = Reflect.ownKeys(o2);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!TCKUtil.isDeepEqual(o1[key], o2[key], visited)) return false;
    }

    return true;
  },

  /**
   * 判断数组内所有对象内容全部相等
   * @param {Array} arr
   * @returns {boolean}
   */
  allItemsSame(arr) {
    if (!Array.isArray(arr) || arr.length <= 1) return true;
    const first = arr[0];
    return arr.every(item => TCKUtil.isDeepEqual(item, first));
  }
};

export default TCKUtil;

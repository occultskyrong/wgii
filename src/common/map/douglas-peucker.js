/* eslint-disable no-mixed-operators */
/**
 * Douglas Peuker算法
 * 用于曲线散点抽稀
 * 1、在曲线首尾两点A，B之间连接一条直线AB，该直线为曲线的弦；
 * 2、得到曲线上离该直线段距离最大的点C，计算其与AB的距离d；
 * 3、比较该距离与预先给定的阈值threshold的大小，如果小于threshold，则该直线段作为曲线的近似，该段曲线处理完毕。
 * 4、如果距离大于阈值，则用C将曲线分为两段AC和BC，并分别对两段取信进行1~3的处理。
 * 5、当所有曲线都处理完毕时，依次连接各个分割点形成的折线，即可以作为曲线的近似。
 * @see https://www.jianshu.com/p/2e8e7b6562ba
 * @see https://github.com/LiuTangLei/Douglas-Peucker-js/blob/master/douglas.js
 */

const {
  PI,
  abs,
  acos,
  cos,
  sin,
  sqrt,
} = Math;

/**
 * 坐标点经纬度转换为三角函数中度分秒形式
 * @param {float} d 经纬度
 */
const rad = d => d * PI / 180.0;

/**
 * 计算地球两点之间的距离
 * @param {array} point1 A点，[longitude,latitude]
 * @param {array} point2 B点
 * 球面距离公式: S = R·arc cos[cosβ1 * cosβ2 * cos(α1-α2) + sinβ1 * sinβ2]
 * 其中α为横坐标，即经度角，β为纬度角
 */
const calcDistance = (point1, point2) => {
  const α1 = rad(point1[0]); // 经度角
  const β1 = rad(point1[1]); // 纬度角
  const α2 = rad(point2[0]);
  const β2 = rad(point2[1]);
  const s = acos(cos(β1) * cos(β2) * cos(α1 - α2) + sin(β1) * sin(β2));
  return s * 6371.393; // 地球平均半径km；因地点不同，半径不同，不过多考虑误差。
};
/**
 * 计算任一点pX到点pA和pB所确定的直线（弦）的高度
 * @param {array} pointA 起点
 * @param {array} pointB 终点
 * @param {array} poingX 任一点
 * 海伦公式：S = √ ( p * (p-a) * (p-b) * (p-c) )
 * 其中a、b、c为三角形边长，S为三角形面积，p为半周长
 */
const calcHeight = (pointA, pointB, poingX) => {
  const a = abs(calcDistance(pointA, pointB));
  const b = abs(calcDistance(pointA, poingX));
  const c = abs(calcDistance(pointB, poingX));
  const p = (a + b + c) / 2.0; // 半周长
  const s = sqrt(abs(p * (p - a) * (p - b) * (p - c)));
  return s * 2.0 / a; // 三角形面积 S = 2ah => h = S/2a
};

/**
 * 算法实现：递归方式抽稀散点线
 * @param {array} coordinates 坐标点
 * @param {int} max 阈值，单位km
 */
const sparse = (coordinates, max) => {
  let result = [];
  if (!coordinates || coordinates.length <= 2) {
    return result;
  }
  const end = coordinates.length - 1; // 终点位置
  let maxHeight = 0; // 最大弦高度
  let maxIndex = 0; // 最大弦高度对应索引值
  const startPoint = coordinates[0]; // 起点
  const endPoint = coordinates[end]; // 终点
  // 依次计算起点、终点与其他点的弦高度，取最大值
  for (let i = 1; i < end; i += 1) {
    const height = calcHeight(startPoint, endPoint, coordinates[i]);
    if (height > maxHeight) {
      maxHeight = height;
      maxIndex = i;
    }
  }
  if (maxHeight >= max) { // 若有点弦高超出阈值，则保留最大值点
    // 以最大点抽稀两侧散点
    const leftResults = sparse(coordinates.slice(0, maxIndex), max);
    const rightResults = sparse(coordinates.slice(maxIndex, end), max);
    result = result.concat(leftResults);
    result.push(coordinates[maxIndex]);
    result = result.concat(rightResults);
  }
  return result;
};

/**
 * 抛出调用
 * @param {array} coordinates 坐标点集
 * @param {number} max 阈值
 */
const douglasPeucker = (coordinates, max) => {
  let pointsArray = coordinates;
  let result = [];
  const { length } = coordinates;
  if (!coordinates || length <= 2) {
    return result;
  }
  // 闭环曲线，首尾相同，去除尾点
  if (JSON.stringify(coordinates[0]) === JSON.stringify(coordinates[length - 1])) {
    pointsArray = coordinates.slice(0, length - 2);
  }
  result.push(pointsArray[0]);
  result = result.concat(sparse(pointsArray, max));
  result.push(coordinates[length - 1]);
  return result;
};

module.exports = douglasPeucker;

/*
 * @Description: 
 * @version: 
 * @Author: zhoujiafeng
 * @Date: 2022-07-23 10:58:09
 * @LastEditTime: 2022-07-28 15:09:37
 * @FilePath: /translate-tool/src/index.js
 * @LastEditors: Please set LastEditors
 */
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const command = 'git status';
const targetDir = 'src/locales';
const mainLanguage = 'zh';
const lauguageDir = {
  'en': 'en'
};
const ADD = 'add';
const MODIFIED = 'modified';
const DELETE = 'delete';

// 获取git改动清单
const getArrList = (str, type) => {
  const arr = str.split('\n')
  return arr.filter(item => {
    const regex = new RegExp(`[${type}].*`)
    if (regex.test(item)) {
      return item !== undefined
    }
  })
}

/**
 * @description 获取类型清单
 * @param {*} arr
 * @param {*} type M:修改，D：删除 A：新增
 * @returns
 */
const formatList = (arr, type) => {
  return arr.map(item => {
    return item.replace(/\s/g, '').replace(type, '')
  })
}

/**
 * 检测两个文件内容是否一致，主要是检测翻译文件的内容对象key是否一致
 * @param {*} url 文件路径
 * @param {*} targetUrl 目标文件路径
 */
const checkFile = (url, targetUrl) => {
  const content = fs.readFileSync(url).toString();
  const startIndex = content.indexOf('{');
  const endIndex = content.lastIndexOf('}');
  if (startIndex < 0 || endIndex < 0) {
    return false;
  }
  const objString = content.slice(startIndex, endIndex + 1);
  console.log(JSON.parse(JSON.stringify(objString)));
  return true;
}

const ayncFile = (url, type) => {
  const targetDirNames = Object.keys(lauguageDir);
  for (let i = 0; i < targetDirNames.length; i++) {
    const item = targetDirNames[i];
    const fillUrl = path.join(__dirname, url);
    const targetUrl = url.replace(mainLanguage, item);
    const fillTargetUrl = path.join(__dirname, targetUrl);
    if (type === ADD && !fs.existsSync(fillTargetUrl)) {
      fs.copyFile(fillUrl, fillTargetUrl);
      continue;
    }
    if (type === MODIFIED && checkFile(fillUrl, fillTargetUrl)) {

    }
  }
}

exec(command, 'utf8', (err, stdout, stderr) => {
  if (err) {
    console.log('err:', err)
    console.log('stderr:', stderr)
  } else {
    const typeList = ['M', 'D', 'A']
    const dictList = {
      'modified': '修改',
      'delete': '删除',
      'A': '新增'
    };
    const arr = [];
    const stdoutArr = stdout.split('\n').filter(item => item && item.includes('\t')).map(item => item.replace('\t', ''));
    for (let i = 0; i < stdoutArr.length; i++) {
      const current = stdoutArr[i];
      if (!current.includes(targetDir)) {
        continue;
      }
      // 处理修改的文件
      if (current.includes(`${MODIFIED}:`)) {
        const str = current.replace(`${MODIFIED}:`, '').trim();
        ayncFile(str, MODIFIED)
        continue;
      }
      // 处理删除的文件
      if (current.includes('modified')) {
        continue;
      }
      // ayncFile(current, ADD)
      // 处理新增的文件

    }
    stdoutArr.forEach(item => {
      if (item.includes(targetDir)) {
        arr.push(item);
      }
    });
    // let arr
    // typeList.forEach(type => {
    //   arr = getArrList(stdout, type)
    //   arr = formatList(arr, type)
    //   console.log(`${dictList[type]}:`, arr)
    //   const options = {
    //     encoding: 'utf8'
    //   }
    //   const dir = path.resolve(__dirname, '../file')
    //   const data = `${dictList[type]}:\n` + arr.join('\n') + '\n'
    //   if (arr.length > 0) {
    //     fs.appendFile(dir + '/1.txt', data, options, (err) => {
    //       if (err) console.log(err)
    //     })
    //   }
    // })
  }
})

/**
 * 获取文件的修改内容
 * @param {*} fileName 文件名，是一个绝对路径
 */
const getDiffFileContent = (fileName) => {
  exec(`git diff ${fileName}`, 'utf8', (err, stdout, stderr) => {
    if (err) {
      console.log('err:', err)
      console.log('stderr:', stderr)
    } else {

    }
  })
}
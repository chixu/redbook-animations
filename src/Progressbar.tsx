import React from 'react';
import { AbsoluteFill } from 'remotion';


interface ProgressbarProps {
  percent: number;
}

const sentences = [
  [0, "正在连接词库，准备升级词感..."],
  [2, "准备好了吗？我们一起慢慢变强。"],
  [4, "开头最难，你已经赢了很多人。"],
  [6, "状态不错，大脑正在进入专注区。"],
  [9, "进度条动了！这种感觉比刷剧爽。"],
  [15, "别急，就这样一个一个稳稳扎根。"],
  [25, "30%的人此时划走，你会留下吗？"],
  [35, "焦虑正在减少，知识正在增加。"],
  [40, "快一半了！保持节奏，别断掉。"],
  [45, "看，你比你想象中更有定力。"],
  [50, "进度过半！下半场是赢家。"],
  [55, "只有10%的学霸能坚持到这里。"],
  [60, "感觉有点累了？最后几个词更关键。"],
  [65, "胜利就在前方，词汇量正在暴涨！"],
  [75, "进入冲刺关！把这最后几个词吃掉。"],
  [80, "倒计时开始，胜利的芬芳快闻到了。"],
  [85, "最后1分钟！坚持住，你是黑马。"],
  [90, "别走神！见证奇迹的时刻就要到了。"],
  [95, "挑战成功！评论区打个卡奖励自己。"],
  [100, "恭喜你！今天又是自律的一天。"],
]

export const Progressbar: React.FC<ProgressbarProps> = ({ percent }) => {
  // console.log(word)
  const percentInt = Math.round(percent);
  let sentence = '';
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (percentInt >= s[0]) {
      sentence = s[1];
    } else {
      break;
    }
  }
  return (
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '100%',
      height: '6rem',
      color: '#666',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'black',
    }}>
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: `${Math.min(100, percent)}%`,
        height: '6rem',
        backgroundColor: '#004aad',
        zIndex: 1,
      }} />
      <div style={{ zIndex: 2, color: '#fff', fontSize: '2.5rem' }}>
        {`${sentence}${percentInt}%`}
      </div>
    </div>
  );
};

export default Progressbar;
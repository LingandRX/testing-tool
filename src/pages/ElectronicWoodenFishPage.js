import dzmyImg from '../assets/images/dzmy.png';
import {useState} from "react";

const ElectronicWoodenFishPage = () => {
  const [active, setActive] = useState(false);
  
  const clickAnimation = () => {
    setActive(true);
    setTimeout(() => {
      setActive(false);
    }, 120);
  };
  
  return (<div>
    电子木鱼
    <img
      alt={'电子木鱼'}
      src={dzmyImg}
      style={{
        backgroundColor: 'black',
        width: '80%',
        height: '80%',
        cursor: 'pointer',
        transition: 'transform 0.12s ease',
        transform: active ? 'scale(0.92)' : 'scale(1)',
      }}
      onClick={clickAnimation}
    />
  </div>);
};

export default ElectronicWoodenFishPage;
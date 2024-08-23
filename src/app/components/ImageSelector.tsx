'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Counts 타입 정의
type Counts = {
  [key: number]: number;
};

export default function ImageSelector() {
  const initialValues: Counts = {
    1: 10,
    2: 100,
    3: 200,
    4: 500,
    5: 1000,
    6: 2000,
    7: 5000,
    8: 10000,
  };

  const [selectedImage, setSelectedImage] = useState<number>(1);
  const [counts, setCounts] = useState<Counts>(initialValues);
  const [totalMoney, setTotalMoney] = useState<number>(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [upgrades, setUpgrades] = useState<boolean[]>(Array(12).fill(false));
  const [isAchievementModalOpen, setIsAchievementModalOpen] =
    useState<boolean>(false);
  const [autoMinerCount, setAutoMinerCount] = useState<number>(0);
  const [premiumMinerCount, setPremiumMinerCount] = useState<number>(0);
  const [keyDown, setKeyDown] = useState<{ [key: string]: boolean }>({});
  const [isAchievementCompleted, setIsAchievementCompleted] =
    useState<boolean>(false);
  const [isRewardClaimed, setIsRewardClaimed] = useState<boolean>(false);

  const upgradeCosts = [
    100, 250, 500, 1000, 3000, 5000, 10000, 15000, 30000, 50000, 70000, 100000,
  ];

  const reductionValues = [
    2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096,
  ];

  useEffect(() => {
    const savedAchievementStatus = localStorage.getItem(
      'isAchievementCompleted',
    );
    const savedRewardStatus = localStorage.getItem('isRewardClaimed');

    if (savedAchievementStatus) {
      setIsAchievementCompleted(JSON.parse(savedAchievementStatus));
    }

    if (savedRewardStatus) {
      setIsRewardClaimed(JSON.parse(savedRewardStatus));
    }
  }, []);

  useEffect(() => {
    if (totalMoney >= 100000 && !isAchievementCompleted) {
      setIsAchievementCompleted(true);
      localStorage.setItem('isAchievementCompleted', 'true');
    }
  }, [totalMoney, isAchievementCompleted]);

  useEffect(() => {
    const savedMoney = localStorage.getItem('totalMoney');
    const savedUpgrades = localStorage.getItem('upgrades');
    const savedAutoMinerCount = localStorage.getItem('autoMinerCount');
    const savedPremiumMinerCount = localStorage.getItem('premiumMinerCount');
    if (savedPremiumMinerCount) {
      setPremiumMinerCount(parseInt(savedPremiumMinerCount, 10));
    }

    if (savedMoney) {
      setTotalMoney(parseInt(savedMoney, 10));
    }

    if (savedUpgrades) {
      setUpgrades(JSON.parse(savedUpgrades));
    }

    if (savedAutoMinerCount) {
      setAutoMinerCount(parseInt(savedAutoMinerCount, 10));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (keyDown[event.key]) return;
      setKeyDown((prev) => ({ ...prev, [event.key]: true }));
      if (event.key === 'ArrowUp') {
        setSelectedImage((prev) => (prev > 4 ? prev - 4 : prev));
      } else if (event.key === 'ArrowDown') {
        setSelectedImage((prev) => (prev <= 4 ? prev + 4 : prev));
      } else if (event.key === 'ArrowLeft') {
        setSelectedImage((prev) =>
          prev === 1 || prev === 5 ? prev + 3 : prev - 1,
        );
      } else if (event.key === 'ArrowRight') {
        setSelectedImage((prev) =>
          prev === 4 || prev === 8 ? prev - 3 : prev + 1,
        );
      } else if (event.key === 'z' || event.key === 'x') {
        const currentReduction = reductionValues.reduce(
          (acc, val, idx) => (upgrades[idx] ? val : acc),
          1,
        );

        setCounts((prevCounts) => {
          const newCount = prevCounts[selectedImage] - currentReduction;

          if (newCount < 0) {
            const earnedMoney = initialValues[selectedImage];
            const newTotalMoney = totalMoney + earnedMoney;
            setTotalMoney(newTotalMoney);

            localStorage.setItem('totalMoney', newTotalMoney.toString());

            return {
              ...prevCounts,
              [selectedImage]: initialValues[selectedImage],
            };
          } else {
            return {
              ...prevCounts,
              [selectedImage]: newCount,
            };
          }
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeyDown((prev) => ({ ...prev, [event.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedImage, totalMoney, upgrades, keyDown]);

  useEffect(() => {
    if (autoMinerCount > 0) {
      const interval = setInterval(() => {
        setTotalMoney((prevMoney) => {
          const newTotalMoney = prevMoney + 10 * autoMinerCount;
          localStorage.setItem('totalMoney', newTotalMoney.toString());
          return newTotalMoney;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoMinerCount]);

  useEffect(() => {
    if (premiumMinerCount > 0) {
      const interval = setInterval(() => {
        setTotalMoney((prevMoney) => {
          const newTotalMoney = prevMoney + 150 * premiumMinerCount;
          localStorage.setItem('totalMoney', newTotalMoney.toString());
          return newTotalMoney;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [premiumMinerCount]);

  const handleUpgradeClick = (index: number) => {
    if (index > 0 && !upgrades[index - 1]) {
      alert(
        '이 업그레이드를 진행하기 위해서는 이전 업그레이드를 먼저 완료해야 합니다.',
      );
      return;
    }

    if (totalMoney >= upgradeCosts[index]) {
      const newTotalMoney = totalMoney - upgradeCosts[index];
      setTotalMoney(newTotalMoney);
      const newUpgrades = [...upgrades];
      newUpgrades[index] = true;
      setUpgrades(newUpgrades);

      localStorage.setItem('totalMoney', newTotalMoney.toString());
      localStorage.setItem('upgrades', JSON.stringify(newUpgrades));
    } else {
      alert('업그레이드를 진행할 충분한 돈이 없습니다.');
    }
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
  };

  const openUpgradeModal = () => {
    setIsUpgradeModalOpen(true);
  };

  const closeShopModal = () => {
    setIsShopModalOpen(false);
  };

  const openShopModal = () => {
    setIsShopModalOpen(true);
  };

  const handleBuyAutoMiner = () => {
    const autoMinerCost = 10000;

    if (totalMoney >= autoMinerCost) {
      const newTotalMoney = totalMoney - autoMinerCost;
      setTotalMoney(newTotalMoney);
      const newAutoMinerCount = autoMinerCount + 1;
      setAutoMinerCount(newAutoMinerCount);

      localStorage.setItem('totalMoney', newTotalMoney.toString());
      localStorage.setItem('autoMinerCount', newAutoMinerCount.toString());
    } else {
      alert('자동채굴기계를 구매할 충분한 돈이 없습니다.');
    }
  };

  const handleBuyPremiumMiner = () => {
    const premiumMinerCost = 100000;

    if (totalMoney >= premiumMinerCost) {
      const newTotalMoney = totalMoney - premiumMinerCost;
      setTotalMoney(newTotalMoney);
      const newPremiumMinerCount = premiumMinerCount + 1;
      setPremiumMinerCount(newPremiumMinerCount);

      localStorage.setItem('totalMoney', newTotalMoney.toString());
      localStorage.setItem(
        'premiumMinerCount',
        newPremiumMinerCount.toString(),
      );
    } else {
      alert('고급자동채굴기계를 구매할 충분한 돈이 없습니다.');
    }
  };

  const handleClaimReward = () => {
    if (isAchievementCompleted && !isRewardClaimed) {
      const rewardAmount = 10000;
      const newTotalMoney = totalMoney + rewardAmount;
      setTotalMoney(newTotalMoney);
      setIsRewardClaimed(true);

      localStorage.setItem('totalMoney', newTotalMoney.toString());
      localStorage.setItem('isRewardClaimed', 'true');
    } else {
      alert('이미 보상을 수령했거나 업적을 달성하지 않았습니다.');
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="fixed top-4 left-4 text-2xl font-bold z-50">
        <button
          onClick={() => setIsAchievementModalOpen(true)}
          className="ml-4 mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg"
        >
          업적
        </button>
      </div>
      <div className="fixed top-4 right-4 text-2xl font-bold z-50">
        {totalMoney.toLocaleString()}원
        <button
          onClick={openUpgradeModal}
          className="ml-4 mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          업그레이드
        </button>
        <button
          onClick={openShopModal}
          className="ml-4 mt-2 px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          상점
        </button>
      </div>

      {isAchievementModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">업적</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-xl font-semibold">소지액 100,000원 달성</h3>
                <p className="text-sm">보상 : 10,000 원</p>
                {isAchievementCompleted ? (
                  isRewardClaimed ? (
                    <button
                      className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg"
                      disabled
                    >
                      완료
                    </button>
                  ) : (
                    <button
                      onClick={handleClaimReward}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      수령
                    </button>
                  )
                ) : (
                  <button
                    className="mt-2 px-4 py-2 bg-gray-300 text-black rounded-lg"
                    disabled
                  >
                    진행 중
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsAchievementModalOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">업그레이드</h2>
            <div className="grid grid-cols-4 gap-4">
              {upgradeCosts.map((cost, index) => (
                <button
                  key={index}
                  onClick={() => handleUpgradeClick(index)}
                  className={`px-4 py-2 rounded-lg ${
                    upgrades[index]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-black'
                  }`}
                  disabled={upgrades[index]}
                >
                  {index + 1}번째 업그레이드
                  <br />
                  비용: {cost}원<br />
                  감소량: {reductionValues[index]}
                </button>
              ))}
            </div>
            <button
              onClick={closeUpgradeModal}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {isShopModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">상점</h2>
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={handleBuyAutoMiner}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-white"
              >
                자동채굴기계
                <br />
                비용: 10000원
                <br />
                매초 10원 추가
              </button>

              <button
                onClick={handleBuyPremiumMiner}
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
              >
                고급자동채굴기계
                <br />
                비용: 100000원
                <br />
                매초 150원 추가
              </button>
            </div>
            <button
              onClick={closeShopModal}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mt-8">
        <div
          className="relative flex flex-col items-center"
          style={{ width: '300px', height: '250px', marginBottom: '20px' }}
        >
          <Image
            src="/img/Dimg1.jpg"
            alt="Dummy 1"
            width={300}
            height={250}
            className={`object-cover w-full h-full ${
              selectedImage === 1 ? 'border-blue-500' : 'border-transparent'
            }`}
          />
          {selectedImage === 1 && (
            <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none"></div>
          )}
          <p className="mt-2 text-lg font-semibold">{counts[1]}</p>
        </div>
        <div
          className="relative flex flex-col items-center"
          style={{ width: '300px', height: '250px', marginBottom: '20px' }}
        >
          <Image
            src="/img/Dimg2.jpg"
            alt="Dummy 2"
            width={300}
            height={250}
            className={`object-cover w-full h-full ${
              selectedImage === 2 ? 'border-blue-500' : 'border-transparent'
            }`}
          />
          {selectedImage === 2 && (
            <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none"></div>
          )}
          <p className="mt-2 text-lg font-semibold">{counts[2]}</p>
        </div>
        <div
          className="relative flex flex-col items-center"
          style={{ width: '300px', height: '250px', marginBottom: '20px' }}
        >
          <Image
            src="/img/Dimg3.jpg"
            alt="Dummy 3"
            width={300}
            height={250}
            className={`object-cover w-full h-full ${
              selectedImage === 3 ? 'border-blue-500' : 'border-transparent'
            }`}
          />
          {selectedImage === 3 && (
            <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none"></div>
          )}
          <p className="mt-2 text-lg font-semibold">{counts[3]}</p>
        </div>
        <div
          className="relative flex flex-col items-center"
          style={{ width: '300px', height: '250px', marginBottom: '20px' }}
        >
          <Image
            src="/img/Dimg4.jpg"
            alt="Dummy 4"
            width={300}
            height={250}
            className={`object-cover w-full h-full ${
              selectedImage === 4 ? 'border-blue-500' : 'border-transparent'
            }`}
          />
          {selectedImage === 4 && (
            <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none"></div>
          )}
          <p className="mt-2 text-lg font-semibold">{counts[4]}</p>
        </div>
        <div
          className="relative flex flex-col items-center"
          style={{ width: '300px', height: '250px' }}
        >
          <Image
            src="/img/Dimg5.jpg"
            alt="Dummy 5"
            width={300}
            height={250}
            className={`object-cover w-full h-full ${
              selectedImage === 5 ? 'border-blue-500' : 'border-transparent'
            }`}
          />
          {selectedImage === 5 && (
            <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none"></div>
          )}
          <p className="mt-2 text-lg font-semibold">{counts[5]}</p>
        </div>
        <div
          className="relative flex flex-col items-center"
          style={{ width: '300px', height: '250px' }}
        >
          <Image
            src="/img/Dimg6.jpg"
            alt="Dummy 6"
            width={300}
            height={250}
            className={`object-cover w-full h-full ${
              selectedImage === 6 ? 'border-blue-500' : 'border-transparent'
            }`}
          />
          {selectedImage === 6 && (
            <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none"></div>
          )}
          <p className="mt-2 text-lg font-semibold">{counts[6]}</p>
        </div>
        <div
          className="relative flex flex-col items-center"
          style={{ width: '300px', height: '250px' }}
        >
          <Image
            src="/img/Dimg7.jpg"
            alt="Dummy 7"
            width={300}
            height={250}
            className={`object-cover w-full h-full ${
              selectedImage === 7 ? 'border-blue-500' : 'border-transparent'
            }`}
          />
          {selectedImage === 7 && (
            <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none"></div>
          )}
          <p className="mt-2 text-lg font-semibold">{counts[7]}</p>
        </div>
        <div
          className="relative flex flex-col items-center"
          style={{ width: '300px', height: '250px' }}
        >
          <Image
            src="/img/Dimg8.jpg"
            alt="Dummy 8"
            width={300}
            height={250}
            className={`object-cover w-full h-full ${
              selectedImage === 8 ? 'border-blue-500' : 'border-transparent'
            }`}
          />
          {selectedImage === 8 && (
            <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none"></div>
          )}
          <p className="mt-2 text-lg font-semibold">{counts[8]}</p>
        </div>
      </div>
    </div>
  );
}

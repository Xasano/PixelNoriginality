import { useEffect, useState } from "react";
import { FaUser, FaThLarge, FaPaintBrush } from "react-icons/fa";
import GridBGComponent from "@components/GridBGComponent";
import ActivePixelBoards3DCarousel from "@components/pixelboard/ActivePixelBoardsCarousel";
import FinishedPixelBoards3DCarousel from "@components/pixelboard/FinishedPixelBoards";
import { apiService } from "./helpers/request";

function App() {
  const [stats, setStats] = useState({
    nbUsers: 0,
    nbPixelBoards: 0,
    nbContributions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Animation de compteur pour les chiffres
    const animateValue = (
      start: number,
      end: number,
      duration: number,
      setter: (val: number) => void,
    ) => {
      if (start === end) return;
      const range = end - start;
      const minFrames = 30;
      const frameCount = Math.max(minFrames, Math.min(duration / 10, 200));
      let currentFrame = 0;

      const animate = () => {
        currentFrame++;
        const progress = currentFrame / frameCount;
        const value = Math.floor(start + range * progress);
        setter(value);

        if (currentFrame < frameCount) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    setLoading(true);
    apiService
      .get<{
        userCount: number;
        pixelBoardCount: number;
        contributionCount: number;
      }>("/stats/")
      .then((data) => {
        setLoading(false);
        setStats({
          nbUsers: 0,
          nbPixelBoards: 0,
          nbContributions: 0,
        });

        setTimeout(() => {
          animateValue(0, data.userCount, 1000, (val) =>
            setStats((prev) => ({ ...prev, nbUsers: val })),
          );
          animateValue(0, data.pixelBoardCount, 1000, (val) =>
            setStats((prev) => ({ ...prev, nbPixelBoards: val })),
          );
          animateValue(0, data.contributionCount, 1000, (val) =>
            setStats((prev) => ({ ...prev, nbContributions: val })),
          );
        }, 300);
      })
      .catch((error) => {
        setLoading(false);
        console.error(
          "Erreur lors de la récupération des statistiques:",
          error,
        );
      });
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  return (
    <div className="w-full overflow-x-hidden">
      <section className="flex flex-col items-center dark:bg-black dark:text-white">
        <div className="w-full h-screen">
          <GridBGComponent>
            <div className="flex flex-col items-start justify-center w-full h-full px-8">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold m-0">
                PixelNoriginality
              </h1>
              <h2
                id="home-subtitle"
                className="text-5xl max-w-[300px] sm:text-6xl sm:max-w-[400px] my-3 md:text-8xl md:max-w-[600px] md:my-6 font-bold"
              >
                Create your own Pixel Boards
              </h2>
            </div>
          </GridBGComponent>
        </div>
      </section>

      <section className="w-full py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
        <div className="max-w-screen-xl mx-auto px-4 dark:text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
              Statistiques
            </h3>
            <p className="max-w-2xl mx-auto">
              Notre univers pixelisé en chiffres : utilisateurs, créations et
              contributions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <FaUser />
                  </div>
                  <div className="flex items-center text-sm font-medium text-green-500"></div>
                </div>
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Utilisateurs inscrits
                </h4>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatNumber(stats.nbUsers)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    créateurs
                  </span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                    <FaThLarge />
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">
                  PixelBoards créés
                </h4>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatNumber(stats.nbPixelBoards)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    œuvres
                  </span>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                    <FaPaintBrush />
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Pixels placés
                </h4>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatNumber(stats.nbContributions || 0)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section PixelBoards actifs - ajoutée */}
      <section className="w-full max-w-screen-xl mx-auto px-6 py-12">
        <ActivePixelBoards3DCarousel />
      </section>

      <section className="w-full max-w-screen-xl mx-auto px-6 py-12">
        <FinishedPixelBoards3DCarousel />
      </section>
    </div>
  );
}

export default App;

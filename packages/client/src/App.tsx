import GridBGComponent from "./components/GridBGComponent";
import stats_profil from "./assets/stats_profil.png";
import stats_pixelboard from "./assets/stats_pixelboard.png";
import stats_pixels from "./assets/stats_pixels.png";

function App() {
  return (
    <div className="w-full">
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
        <div className="flex flex-col items-center justify-center w-full"></div>
      </section>
      {/* TODO : ajouter les statistiques dans les placeholders */}
      <section className="w-full max-w-screen-xl mx-auto p-4 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-lg">
        <h3 className="text-lg font-bold text-2xl mb-4">Statistiques</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Première ligne */}
          <div className="card bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <img src={stats_profil} alt="Stat 1" className="w-full h-32 object-cover rounded-t-lg"/>
            <div className="flex justify-between p-4">
              <span className="text-xl font-bold">Nombre d'utilisateurs inscrit</span>
              <span className="text-lg text-right">Valeur</span>
            </div>
          </div>
          <div className="card bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <img src={stats_pixelboard} alt="Stat 2" className="w-full h-32 object-cover rounded-t-lg" />
            <div className="flex justify-between p-4">
              <span className="text-xl font-bold">Nombres de PixelBoard</span>
              <span className="text-lg text-right">Valeur</span>
            </div>
          </div>
          <div className="card bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <img src={stats_pixels} alt="Stat 3" className="w-full h-32 object-cover rounded-t-lg" />
            <div className="flex justify-between p-4">
              <span className="text-xl font-bold">Nombre total de pixels placés</span>
              <span className="text-lg text-right">Valeur</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

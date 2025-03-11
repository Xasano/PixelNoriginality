import React, { useEffect, useState } from "react";
import GridBGComponent from "./components/GridBGComponent";
import stats_profil from "./assets/stats_profil.png";
import stats_pixelboard from "./assets/stats_pixelboard.png";
import stats_pixels from "./assets/stats_pixels.png";
import axios from "axios";

function App() {

  const [nbUsers, setNbUsers] = useState(0);
  const [nbPixelBoards, setNbPixelBoards] = useState(0);
  const [nbPixels, setNbPixels] = useState(0);

  useEffect(() => {
    // Remplacez l'URL par l'URL de votre API
    axios.get("http://localhost:8000/api/stats/")
      .then(response => {
        setNbUsers(response.data.userCount);
        setNbPixelBoards(response.data.pixelBoardCount);
        setNbPixels(response.data.pixelCount);
        console.log("Statistiques récupérées :", response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération du nombre d'utilisateurs :", error);
      });
  }, []);

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
        <div className="flex flex-col items-center justify-center w-full"></div>
      </section>
      <section className="w-full max-w-screen-xl mx-auto p-4 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-lg">
        <h3 className="text-lg font-bold text-2xl mb-4">Statistiques</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <img src={stats_profil} alt="Stat 1" className="w-full h-32 object-cover rounded-t-lg"/>
            <div className="flex justify-between p-4">
              <span className="text-xl font-bold">Nombre d'utilisateurs inscrit</span>
              <span className="text-lg text-right">{nbUsers || '0'}</span>
            </div>
          </div>
          <div className="card bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <img src={stats_pixelboard} alt="Stat 2" className="w-full h-48 object-cover rounded-t-lg" />
            <div className="flex justify-between p-4">
              <span className="text-xl font-bold">Nombres de PixelBoard</span>
              <span className="text-lg text-right">{nbPixelBoards || '0'}</span>
            </div>
          </div>
          <div className="card bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <img src={stats_pixels} alt="Stat 3" className="w-full h-48 object-cover rounded-t-lg" />
            <div className="flex justify-between p-4">
              <span className="text-xl font-bold">Nombre total de pixels placés</span>
              <span className="text-lg text-right">{nbPixels || '0'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

import GridBGComponent from "./components/GridBGComponent";

function App() {
  return (
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
  );
}

export default App;

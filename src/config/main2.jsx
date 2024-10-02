     {/* Main City Card */}
        <div className="w-full h-[400px] lg:w-[30%] lg:h-full mainCardBg p-5 rounded-xl flex flex-col relative">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">{formattedDate}</p>
              <div className="text-xs font-semibold">
                {new Date().toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true // for 12-hour format
                })}
               </div>
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-full ${unit === 'metric' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setUnit('metric')}
              >
                °C
              </button>
              <button
                className={`px-4 py-2 rounded-full ${unit === 'imperial' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setUnit('imperial')}
              >
                °F
              </button>
            </div>
          </div>

          {loadings ? (
            <div className="flex justify-center items-center h-full">
              <SphereSpinner loadings={loadings} color="#0D1DA9" size={25} />
            </div>
          ) : (
            <>
              {mainCityData && mainCityData.error ? (
                <div className="text-red-500 flex justify-center items-center capitalize font-semibold text-center h-full w-full">{mainCityData.error}</div>
              ) : forecastError ? (
                <div className="text-red-500 flex justify-center items-center capitalize font-semibold text-center h-full w-full">{forecastError}</div>
              ) : (
                carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
                  <div className="flex flex-col w-full h-full">
                    <div className="flex flex-col items-center">
                      <div className="flex justify-between mt-4 w-full items-center">
                        <div className="flex flex-col mt-6 justify-center items-center ">
                          <div className="flex gap-2 items-center">
                            <Icon icon={location} size={20} />
                            <h4 className="text-2xl font-bold">{carouselCities[carouselIndex].data.name}</h4>
                          </div>
                          <img
                            className="w-24 h-24 "
                            src={`https://openweathermap.org/img/wn/${carouselCities[carouselIndex].data.weather[0].icon}@2x.png`}
                            alt="icon"
                          />
                        </div>

                        <div className="flex flex-col gap-4 justify-center items-center">
                          <h1 className="text-6xl font-bold">
                            {carouselIndex === 0
                              ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp)
                              : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp)
                            }
                          </h1>
                          <h4 className="capitalize text-md font-bold">{carouselCities[carouselIndex].data.weather[0].description}</h4>
                        </div>

                      </div>
                    </div>

                    <div className="">
                    <div className="lg:flex hidden flex-row justify-between">
                        <p className="text-sm font-bold" >Feels like {
                          carouselIndex === 0
                            ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.feels_like)
                            : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.feels_like)
                        }</p>
                        <div className="flex space-x-2">
                          <div className="flex items-center text-xs">
                            <Icon icon={arrowUp} size={14} className="" />
                            <span className="font-bold">{
                              carouselIndex === 0
                                ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_max)
                                : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_max)
                            }</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <Icon icon={arrowDown} size={14} className="" />
                            <span className="font-bold">{
                              carouselIndex === 0
                                ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_min)
                                : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_min)
                            }</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row mt-6 justify-between mx-2">
                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={droplet} size={40} className=" mt-1" />
                          <span className="text-xs mt-1 font-semibold">{carouselCities[carouselIndex].data.main.humidity} %</span>
                          <div className="w-full mt-1 bg-gray-200 dark:bg-gray-500 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                           style={{ width: `${mainCityData && mainCityData.data ? mainCityData.data.main.humidity : 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs mt-1 font-bold">Humidity</p>
                        </div>

                        <div className={`border-l-2 ${currentTheme === 'dark' ? 'border-gray-300' : 'border-black'}  h-20 mx-4 mt-4`}></div>

                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={wind} size={40} className=" mt-1" />
                          <div className="flex text-xs mt-1 font-semibold items-center">
                            <span>{mainCityData && mainCityData.data && `${mainCityData.data.wind.deg}°`}</span>
                          </div>
                          <div className="text-xs font-bold">
                            {mainCityData && mainCityData.data && `${mainCityData.data.wind.speed} ${unit === 'metric' ? 'km/h' : 'mph'}`}
                          </div>

                          <p className="text-xs mt-1 font-bold">Wind</p>
                        </div>

                        <div className={`border-l-2 ${currentTheme === 'dark' ? 'border-gray-300' : 'border-black'}  h-20 mx-4 mt-4`}></div>

                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={activity} size={40} className="mt-1" />
                          <div className="text-xs mt-1 font-semibold">Normal</div>
                          <span className="text-xs mt-1 font-bold">{carouselCities[carouselIndex].data.main.pressure} hPa</span>
                          <p className="text-xs mt-1 font-bold">Pressure</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
          <div className="flex justify-center mt-4">
            {carouselCities.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 mx-1 rounded-full ${index === carouselIndex ? 'bg-blue-900' : 'bg-gray-300'}`}
                onClick={() => handleCarouselChange(index)}
              />
            ))}
          </div>

          {/* <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full px-2">
            <button onClick={handlePrevCarousel} className="text-gray-500 hover:text-gray-700">
              <Icon icon={chevronLeft} size={24} />
            </button>
            <button onClick={handleNextCarousel} className="text-gray-500 hover:text-gray-700">
              <Icon icon={chevronRight} size={24} />
            </button>
          </div> */}

         </div>
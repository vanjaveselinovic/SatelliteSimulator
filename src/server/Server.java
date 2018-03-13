package server;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import data.ConstellationData;
import data.GroundStationData;
import data.SimulationConfigurationData;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class Server {
	public static void main(String[] args) throws Exception {
		HttpServer server = HttpServer.create(new InetSocketAddress(4321), 0);
		server.createContext("/simulator", new MyHandler());
		server.setExecutor(null);
		server.start();
	}

	static class MyHandler implements HttpHandler {
		@Override
		public void handle(HttpExchange t) throws IOException {
			// Deal with request
			
			System.out.println("Uri: " + t.getRequestURI());
			
			InputStreamReader isr =  new InputStreamReader(t.getRequestBody(), "utf-8");
			BufferedReader br = new BufferedReader(isr);
			
			int b;
			StringBuilder buffer = new StringBuilder();
			while ((b = br.read()) != -1) {
			    buffer.append((char) b);
			}

			br.close();
			isr.close();
			
			String jsonString = buffer.toString().replace('"', '\'');
			
			if (jsonString != null && !jsonString.isEmpty()) {
				System.out.println(jsonString);
				
				try {
					JSONObject jsonObject = new JSONObject(jsonString);
					
					JSONObject constellationsObj = jsonObject.getJSONObject("constellations");
					JSONArray groundStationsArr = jsonObject.getJSONArray("groundStations");
					JSONObject simulationObj = jsonObject.getJSONObject("simulation");
					
					// Constellations
					
					JSONArray elements = constellationsObj.getJSONArray("elements");
					
					ConstellationData constellations[] = new ConstellationData[elements.length()];
					
					JSONObject currentElement;
					
					for (int i = 0; i < constellations.length; i++) {
						currentElement = elements.getJSONObject(i);
						
						constellations[i] = new ConstellationData(
									currentElement.getDouble("orbitalPeriod"), //TODO: convert period to axis
									currentElement.getDouble("inclination"),
									currentElement.getInt("numSatellitesPerRing"),
									currentElement.getInt("numRings"),
									0.5
								);
					}
					
					// Ground stations
					
					GroundStationData groundStations[] = new GroundStationData[1];
					
					System.out.println("Done taking in configuration data");
					
					SimulationConfigurationData simulationConfigurationData =
							new SimulationConfigurationData(
										constellations,
										groundStations
									);
					
					// Run simulation
					
					// Manager manager = new Manager(simulationConfigurationData);
					// manager.run();
	
					
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
			}
			
			// Response
			
			String response = "{\"started\": true}";
			System.out.println("Response: " + response);
			t.sendResponseHeaders(200, response.length());
			OutputStream os = t.getResponseBody();
			os.write(response.getBytes());
			os.close();
		}

		static String convertStreamToString(java.io.InputStream is) {
			java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
			return s.hasNext() ? s.next() : "";
		}
	}
}
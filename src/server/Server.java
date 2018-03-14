package server;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import core.Manager;
import data.ConstellationData;
import data.GroundStationData;
import data.OutputData;
import data.SimulationConfigurationData;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class Server {
	public static void main(String[] args) throws Exception {
		HttpServer server = HttpServer.create(new InetSocketAddress(1234), 0);
		server.createContext("/", new MainHandler());
		server.createContext("/simulator", new SimulateHandler());
		server.createContext("/check", new CheckHandler());
		server.setExecutor(null);
		server.start();
	}
	
	// adapted from user2576465 on Stack Overflow
	// https://stackoverflow.com/questions/15902662/how-to-serve-static-content-using-suns-simple-httpserver
	static class MainHandler implements HttpHandler {
		@Override
		public void handle (HttpExchange t) throws IOException {
			String root = "";
            URI uri = t.getRequestURI();
            System.out.println("looking for: "+ root + uri.getPath());
            String path = uri.getPath().substring(1);
            if (path.isEmpty()) path = "index.html";
            File file = new File(root + path).getCanonicalFile();

            if (!file.isFile()) {
              // Object does not exist or is not a file: reject with 404 error.
              String response = "404 (Not Found)\n";
              t.sendResponseHeaders(404, response.length());
              OutputStream os = t.getResponseBody();
              os.write(response.getBytes());
              os.close();
            } else {
              // Object exists and is a file: accept with response code 200.
              String mime = "text/html";
              if(path.substring(path.length()-3).equals(".js")) mime = "application/javascript";
              if(path.substring(path.length()-3).equals("css")) mime = "text/css";            

              Headers h = t.getResponseHeaders();
              h.set("Content-Type", mime);
              t.sendResponseHeaders(200, 0);              

              OutputStream os = t.getResponseBody();
              FileInputStream fs = new FileInputStream(file);
              final byte[] buffer = new byte[0x10000];
              int count = 0;
              while ((count = fs.read(buffer)) >= 0) {
                os.write(buffer,0,count);
              }
              fs.close();
              os.close();
            }  
		}
	}

	static OutputData lastOutput = null;
	static Object manager_lock = new Object();
	static class SimulateHandler implements HttpHandler {
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
									0.5,
									"double".equals(currentElement.getString("type"))
								);
					}
					
					// Ground stations
					
					GroundStationData groundStations[] = new GroundStationData[groundStationsArr.length()];
					
					JSONObject currentGroundStation;
					
					for (int i = 0; i < groundStations.length; i++) {
						currentGroundStation = groundStationsArr.getJSONObject(i);
						
						groundStations[i] = new GroundStationData(
									currentGroundStation.optString("uniqueName"),
									currentGroundStation.getString("name"),
									currentGroundStation.getDouble("lat"),
									currentGroundStation.getDouble("lon"),
									currentGroundStation.getString("traffic")
								);
					}
					
					System.out.println("Done taking in configuration data");
					
					// Simulation configuration
					
					SimulationConfigurationData simulationConfigurationData =
							new SimulationConfigurationData(
										constellations,
										groundStations,
										simulationObj.getString("startTime"),
										simulationObj.getInt("duration"),
										simulationObj.getDouble("interval")
									);
					
					// Run simulation
					new Thread(new Runnable() {

						@Override
						public void run() {
							synchronized(manager_lock) {
								System.out.println("ready to simulate");
								
								Manager manager = new Manager(simulationConfigurationData);
								
								System.out.println("manager set up");
								
								manager.run();
								
								lastOutput = manager.output();
								
								System.out.println("Done!");
								
							}
						}
					
					}).start();
					
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
	
	static class CheckHandler implements HttpHandler {
		@Override
		public void handle(HttpExchange t) throws IOException {
			System.out.println("Web app checking if simulation is done...");
			String response = "{\"done\": "+(lastOutput != null)+"}";
			System.out.println("Response: " + response);
			t.sendResponseHeaders(200, response.length());
			OutputStream os = t.getResponseBody();
			os.write(response.getBytes());
			os.close();
		}
	}
}
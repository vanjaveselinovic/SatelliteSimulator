package server;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;


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
			// Response
			
			String response = "{\"started\": true}";
			t.sendResponseHeaders(200, response.length());
			OutputStream os = t.getResponseBody();
			os.write(response.getBytes());
			os.close();
			
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
			System.out.println(jsonString);
			
			if (jsonString != null && !jsonString.isEmpty()) {
				System.out.println("Test");
				
				Gson gson = new Gson();
				Map<String, String> myMap = gson.fromJson(
						jsonString,
						new TypeToken<Map<String, String>>(){}.getType());
				
				System.out.println("Test: " + myMap.get("name"));
			}
			
			/*
			 * Run simulation
			 */
			
			// Manager manager = new Manager(simulationConfigurationData);
			// manager.run();
		}

		static String convertStreamToString(java.io.InputStream is) {
			java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
			return s.hasNext() ? s.next() : "";
		}
	}
}
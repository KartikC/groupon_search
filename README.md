# groupon_search
---
* Chosen as a Winner of a MindSumo Computer Science Challenge hosted by Groupon
* Demo: http://people.rit.edu/kps5889/140/groupon/


Challenge:

"Use the Groupon API to create an application with an auto-complete search box for merchant name and a location box. As an additional challenge, have your auto-complete algorithm take distance into account and order the list of merchants by distance from the consumers search location instead of alphabetically."

Solution:

You can either use geolocation via your browser or type in an address manually and press enter to find your Groupon division. When you type your address you can enter something as simple as 'san fran' and press enter thanks to Google's reverse geocoding. Then you can start typing to see deals pop up automatically sorted by distance. Your search will look anywhere within the deal's title so you can see everything quicker.

I chose to use the spherical law of cosines to measure distance since there was a good balance between accuracy and performance compared to using haversine. I thought of using a prefix tree for the dictionary but after some tests it seems that the initial building time isn't worth the faster lookups.
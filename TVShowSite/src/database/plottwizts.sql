-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: plottwizts
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `comment_text` text NOT NULL,
  `other_user_id` int DEFAULT NULL,
  `episode_id` int NOT NULL,
  `review_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `episode_id_idx` (`episode_id`),
  KEY `user_id_idx` (`user_id`),
  KEY `other_user_id_idx` (`other_user_id`),
  KEY `fk_review_id` (`review_id`),
  CONSTRAINT `episode_id` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_id` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='reviews';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (2,12,'nu nez, man *tā* tas šovs',NULL,17,60,'2025-06-09 13:23:28'),(4,13,'ծ_Ô',NULL,1,16,'2025-06-09 13:28:06'),(7,13,'waow',NULL,16,66,'2025-06-09 14:21:35'),(8,14,'Es piekrītu. Mans milzīgais intelekts ir novērtējis šo sēriju kā: \"Apmierinošs.\" Jūsu atsauksme ir pilnīgi precīza, turpiniet veidot šādas atsauksmes.',NULL,16,66,'2025-06-10 21:47:28'),(10,12,'zini you are so right, gudrais',NULL,16,66,'2025-06-10 22:12:05'),(12,15,'uzvedies, uzvedies',NULL,14,64,'2025-06-11 16:27:07'),(16,17,'nahhh this is good what u on about bro',NULL,17,60,'2025-06-11 19:25:44');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `episodes`
--

DROP TABLE IF EXISTS `episodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `episodes` (
  `id` int NOT NULL,
  `series_id` int NOT NULL,
  `season_number` int NOT NULL,
  `episode_number` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `air_date` date DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `episodes`
--

LOCK TABLES `episodes` WRITE;
/*!40000 ALTER TABLE `episodes` DISABLE KEYS */;
INSERT INTO `episodes` VALUES (1,1,1,1,'Apéritif','2013-04-04','hannibal_01.jpg'),(2,1,1,2,'Amuse-Bouche','2013-04-11','hannibal_01.jpg'),(3,1,1,3,'Potage','2013-04-18','hannibal_01.jpg'),(4,1,1,4,'Œuf','2013-04-24','hannibal_01.jpg'),(5,1,1,5,'Coquilles','2013-04-25','hannibal_01.jpg'),(6,1,1,6,'Entrée','2013-05-02','hannibal_01.jpg'),(7,1,1,7,'Sorbet','2013-05-09','hannibal_01.jpg'),(8,1,1,8,'Fromage','2013-05-16','hannibal_01.jpg'),(9,1,1,9,'Trou Normand','2013-05-23','hannibal_01.jpg'),(10,1,1,10,'Buffet Froid','2013-05-30','hannibal_01.jpg'),(11,1,1,11,'Rôti','2013-06-06','hannibal_01.jpg'),(12,1,1,12,'Relevés','2013-06-13','hannibal_01.jpg'),(13,1,1,13,'Savoureux','2013-06-20','hannibal_01.jpg'),(14,2,1,1,'The Man Trap','1966-09-08','star-trek_01.jpg'),(15,2,1,2,'Charlie X','1966-09-15','star-trek_01.jpg'),(16,2,1,3,'Where No Man Has Gone Before','1966-09-22','star-trek_01.jpg'),(17,7,1,1,'Pilot','1999-01-10','the-sopranos_01.png'),(18,8,1,1,'The Cat and the Claw (1)','1992-09-05','batman-the-animated-series_01.jpg'),(19,8,1,2,'On Leather Wings','1992-09-06','batman-the-animated-series_01.jpg'),(20,8,1,3,'Heart of Ice','1992-09-07','batman-the-animated-series_01.jpg'),(21,8,1,4,'Feat of Clay (1)','1992-09-08','batman-the-animated-series_01.jpg'),(22,8,1,5,'Feat of Clay (2)','1992-09-09','batman-the-animated-series_01.jpg');
/*!40000 ALTER TABLE `episodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotes`
--

DROP TABLE IF EXISTS `quotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotes` (
  `id` int NOT NULL,
  `quote` text NOT NULL,
  `series_title` varchar(255) NOT NULL,
  `season` int NOT NULL,
  `episode` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotes`
--

LOCK TABLES `quotes` WRITE;
/*!40000 ALTER TABLE `quotes` DISABLE KEYS */;
INSERT INTO `quotes` VALUES (1,'I am the danger.','Breaking Bad',1,6),(2,'Winter is coming.','Game of Thrones',3,22),(3,'How you doin\'?','Friends',4,1),(4,'Bazinga!','The Big Bang Theory',3,5),(5,'D\'oh!','The Simpsons',1,1),(6,'How much cheese is too much cheese?','It\'s Always Sunny in Philadelphia',4,2),(7,'Especially the lies.','Star Trek Deep Space Nine',2,3),(8,'Death to the opposition!','Star Trek Deep Space Nine',1,2),(9,'To think, after all this time, all our lunches together you still don\'t trust me. There\'s hope for you yet, doctor.','Star Trek Deep Space Nine',5,2),(10,'Father, you\'re dying. For once in your life, speak the truth.','Star Trek Deep Space Nine',7,4),(11,'Love and death are the great hinges on which all human sympathies turn.','Hannibal',8,6),(12,'Peter, is your social worker inside that horse?','Hannibal',7,4),(13,'What we do for ourselves, dies with us. What we do for others, lives beyond us','Hannibal',4,1),(14,'You righteous, reckless, twitchy, little man!','Hannibal',6,4),(15,'Don’t be afraid, start the tape','Interview with the Vampire',2,1),(16,'The wilderness that is our daughter.','Interview with the Vampire',1,2),(17,'Memory is a monster. We forget, it doesn’t.','Interview with the Vampire',1,1);
/*!40000 ALTER TABLE `quotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_reactions`
--

DROP TABLE IF EXISTS `review_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `review_id` int NOT NULL,
  `is_like` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review` (`user_id`,`review_id`),
  KEY `review_id` (`review_id`),
  CONSTRAINT `review_reactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_reactions_ibfk_2` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_reactions`
--

LOCK TABLES `review_reactions` WRITE;
/*!40000 ALTER TABLE `review_reactions` DISABLE KEYS */;
INSERT INTO `review_reactions` VALUES (3,13,61,1),(22,13,66,1),(26,14,66,1),(42,14,3,0),(43,14,4,1),(45,14,2,0),(46,14,5,1),(47,14,1,1),(49,14,8,0),(50,14,6,1),(51,14,9,0),(52,14,7,1),(53,14,10,0),(54,14,11,1),(56,14,13,0),(57,14,14,0),(58,14,15,1),(60,14,16,1),(61,14,60,0),(65,14,61,0),(68,14,64,1),(71,12,66,0),(77,17,67,0),(78,17,66,1),(80,17,61,0);
/*!40000 ALTER TABLE `review_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `episode_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `review_text` text NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `review_title` varchar(200) NOT NULL,
  `likes` int DEFAULT '0',
  `dislikes` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id_for_idx` (`user_id`),
  KEY `episode_id_for` (`episode_id`),
  CONSTRAINT `episode_id_for` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_id_for` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating_valid` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,1,4,'Great! Yupp','2023-02-01 00:00:00','Good',1,0,0),(2,2,1,1,'Terrible, never watch this!!!','2022-01-01 00:00:00','Awfulll....',0,1,0),(3,3,2,5,'This is the best thing iver veer seeen. My favourite show everrrr. All my daily refrences come from this. How could anyone hate this????? :(','2012-02-01 22:00:00','the best',0,1,0),(4,4,1,1,'Boringggg ahh hell','2014-04-12 22:00:00','Bored',1,0,0),(5,5,14,5,'Been waiting for this to come on here, loved it with this re-watch just as much as the first time i watched it. Recommend for anyone whos interested in classic Sci-Fi.','2022-12-12 22:00:00','Timeless.',1,0,0),(6,1,2,3,'First epsidoe was better. Not much else to add :/','2023-02-03 00:00:00','Eh...',1,0,0),(7,6,5,3,'Idk waht dis is','2025-02-03 00:00:00','They made me watch dis',1,0,0),(8,1,3,4,'Got better. Ate sum cheese 2day. that mightve influenced my deicsion.','2023-02-03 00:00:00','tis alright',0,1,0),(9,5,15,4,'I really loved the staging and scenery in this one. Kirk really gives his all in the performance. Hate the premise though, really very terrible. Spocks cool as a cucumber as always. :)','2023-12-12 22:00:00','A good one.',0,1,0),(10,2,17,4,'Very interesting insight into mob-life, if true of course. Great acting from the lead, can\'t wait for the rest!','2025-04-09 22:33:12','Great acting',0,1,0),(11,8,1,5,'loooved it','2025-06-02 20:07:41','grreat <3',1,0,0),(12,8,14,2,'ive seen better','2025-06-02 20:12:41','ehhh',0,0,0),(13,8,17,4,'so this was a great one. more shows liek this please!!!!','2025-06-02 20:13:37','suuuuperrrr',0,1,0),(14,8,2,5,'you really cant beat hannibal, theres a lot to love about this show - the cinematography, even the color palette is just amazing in this show. love love love it. <3','2025-06-02 20:16:36','even better',0,1,0),(15,8,17,3,'it was slightly worse on second thought, but fun nonethelesss. so thats a bout it yeah. for sure.','2025-06-02 20:17:32','yah i saw it again',1,0,0),(16,8,1,3,'asdfghfjkljhjgfds','2025-06-02 21:04:51','i really liked this',1,0,1),(60,9,17,5,'superigs','2025-06-03 17:54:58','superr',0,1,2),(61,8,14,2,'nezinu nepatika','2025-06-03 17:55:55','nu taa',1,2,0),(64,11,14,4,'man patika','2025-06-03 18:30:07','labs',1,0,1),(66,12,16,3,'luv dis show sm :3','2025-06-08 22:00:49','just like the title fr',3,1,3),(67,12,18,4,'Amazing animation, Adrienne Barbeau plays a great Catwoman - she was super convincing! Overall very well-done for a pilot, ','2025-06-11 15:48:56','Great first impression',0,1,0);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `series`
--

DROP TABLE IF EXISTS `series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `series` (
  `id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `genre` varchar(100) DEFAULT NULL,
  `release_year` year DEFAULT NULL,
  `series_picture` varchar(255) DEFAULT 'basic_series.png',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `series`
--

LOCK TABLES `series` WRITE;
/*!40000 ALTER TABLE `series` DISABLE KEYS */;
INSERT INTO `series` VALUES (1,'Hannibal','Both a gift and a curse, Graham has the extraordinary ability to think like his prey—he sees what they see, feels what they feel. But while Graham is pursuing an especially troubling, cannibalistic murderer, Special Agent Jack Crawford teams him with a highly respected psychiatrist – a man with a taste for the criminal minded – Dr. Hannibal Lecter.','Drama, Crime',2013,'hannibal.png'),(2,'Star Trek','Space. The Final Frontier. The U.S.S. Enterprise embarks on a five year mission to explore the galaxy. The Enterprise is under the command of Captain James T. Kirk with First Officer Mr. Spock, from the planet Vulcan. With a determined crew, the Enterprise encounters Klingons, Romulans, time paradoxes, tribbles and genetic supermen led by Khan Noonian Singh. Their mission is to explore strange new worlds, to seek new life and new civilizations, and to boldly go where no man has gone before.','Sci-Fi & Fantasy, Drama',1966,'star-trek.png'),(3,'Vicious','Freddie and Stuart are an old couple who have been together for decades and bicker constantly. Their lives are turned upside down by their new upstairs neighbor Ash, who is sure to cause trouble in their mundane lives.','Comedy',2013,'vicious.png'),(4,'The Simpsons','Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.','Family, Animation, Comedy',1989,'the-simpsons.png'),(5,'Breaking Bad','Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family\'s financial future at any cost as he enters the dangerous world of drugs and crime.','Drama, Crime',2008,'breaking-bad.png'),(6,'Better Call Saul','Six years before Saul Goodman meets Walter White. We meet him when the man who will become Saul Goodman is known as Jimmy McGill, a small-time lawyer searching for his destiny, and, more immediately, hustling to make ends meet. Working alongside, and, often, against Jimmy, is “fixer” Mike Ehrmantraut. The series tracks Jimmy’s transformation into Saul Goodman, the man who puts “criminal” in “criminal lawyer\".','Crime, Drama',2015,'better-call-saul.png'),(7,'The Sopranos','The story of New Jersey-based Italian-American mobster Tony Soprano and the difficulties he faces as he tries to balance the conflicting requirements of his home life and the criminal organization he heads. Those difficulties are often highlighted through his ongoing professional relationship with psychiatrist Jennifer Melfi. The show features Tony\'s family members and Mafia associates in prominent roles and story arcs, most notably his wife Carmela and his cousin and protégé Christopher Moltisanti.','Drama',1999,'the-sopranos.png'),(8,'Batman: The Animated Series','Vowing to avenge the murder of his parents, Bruce Wayne devotes his life to wiping out crime in Gotham City as the masked vigilante \"Batman\".','Action & Adventure, Animation, Drama, Mystery ',1992,'batman-tas.png'),(9,'Dexter','Dexter Morgan, a blood spatter pattern analyst for the Miami Metro Police also leads a secret life as a serial killer, hunting down criminals who have slipped through the cracks of justice.','Crime, Drama, Mystery',2006,'dexter.png'),(10,'Sherlock','A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.','Crime, Drama, Mystery ',2010,'sherlock.png'),(11,'House MD','Dr. Gregory House, a drug-addicted, unconventional, misanthropic medical genius, leads a team of diagnosticians at the fictional Princeton–Plainsboro Teaching Hospital in New Jersey.','Drama, Mystery, Comedy',2004,'house-md.png'),(12,'Seinfield','A stand-up comedian and his three offbeat friends weather the pitfalls and payoffs of life in New York City in the \'90s. It\'s a show about nothing.','Comedy',1989,'seinfield.png'),(13,'Interview with the Vampire','A vampire from New Orleans reunites with an ailing reporter to recount a life of bloodlust and toxic romance with the sinister Frenchman who turned him.','Drama, Sci-Fi & Fantasy ',2022,'iwtv.png'),(14,'Severance','Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.',' Drama, Mystery, Sci-Fi & Fantasy ',2022,'severance.jpg'),(15,'Dracula','Transylvania, 1897. The blood-drinking Count Dracula is drawing his plans against Victorian London. And be warned: the dead travel fast.',' Drama, Action & Adventure ',2020,'dracula-2020.jpg'),(16,'The Golden Girls','Four Southern Florida seniors share a house, their dreams, and a whole lot of cheesecake. Bright, promiscuous, clueless and hilarious, these lovely, mismatched ladies form the perfect circle of friends.','Comedy',1985,'the-golden-girls.png');
/*!40000 ALTER TABLE `series` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user','guest') NOT NULL DEFAULT 'user',
  `profile_picture` varchar(255) DEFAULT 'defaultpfp.jpg',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'burgers','burgers@gmail.com','$2b$10$KVCM1Q3jUdG1mzjWpKz4peKp1oTLY7lNw0mxdg/C1ILD2d.cZRUEa','user','pfp1.png'),(2,'yahoo','mario@gmail.com','$2b$10$OtYnN4x7MKeiM9xJ.d7uw.YaUwWaz3EdeCOvMffsGju9iKCswZexq','user','defaultpfp.jpg'),(3,'burr','brr@gmail.com','$2b$10$uoRKHfQBchKlAdBQOzXjbeMBEMqjxTEnjKZzmd4S5wLrZunypveNW','user','pfp2.png'),(4,'darkz','darkz@inbox.lv','$2b$10$g9ZhH3wZwgt8lIOrKyqBgO7sjN47Oa5pF/GLDCcvMlq8CUDaX6O2q','user','pfp3.png'),(5,'claps3','claps@claps.com','$2b$10$3AaR.08ik5xce3JjydqoHuzfRfi1ITjdfkNh8AAiydKIiGL5dn.l6','user','pfp4.png'),(6,'bestuser1234','best@inbox.lv','$2b$10$jFFAYngVcChdEQfOWSYCQuDY7hOnoWw8G34DgbaWB9NZp.Qp8F7tK','user','pfp5.png'),(7,'aasdd','asd@gamil.com','$2b$10$vnP21uiBTMUOYXfFg8lBYOXiroDsjbRqrtZBRJAz4QTFF47GG5FUC','user','defaultpfp.jpg'),(8,'pepsi_man','pepsi_man@gmail.com','$2b$10$aRUC42BHlCcQ3OadLEgVE.Ni2UjcqGyMuxkD5BFaZI09Hgsu00Fxe','user','defaultpfp.jpg'),(9,'parks','parks@gmail.com','$2b$10$6igqOJSpdrrVSjZFMuK/PuLgpI4SZ7m7fmQteX/9hJ8YadugBwnkG','user','defaultpfp.jpg'),(10,'ok','ok@inbox.lv','$2b$10$6SdaTmkOqMhfstwgeZUCdOG9UpO7pjjiJWI.Py7wDbrULChRYPRVG','user','defaultpfp.jpg'),(11,'labs','labs@gmail.com','$2b$10$gvzK2dOuRU2uF6VRiFY.oeWAtuudvyGXDBfRcVQ85DfxefWPaZCn6','user','defaultpfp.jpg'),(12,'abc123','abc@gmail.com','$2b$10$4YPOEJZr6BkP6bbGcIrxXuZ0HDCEJLJIwtKkq7tEqZ7HfdFO37Goa','user','defaultpfp.jpg'),(13,'miers2','miers@gmail.com','$2b$10$Ybw7Y.gQlIQPPDnggX/5JeNapeJJaStFrI.jl27GZc03OEAW68Jly','user','defaultpfp.jpg'),(14,'gudrais','gudrais@gmail.com','$2b$10$e9Nu/j/Vu6rD9b/Yv4KJo.JvxgB4f5MTqeQ7qKrcrkmCXAvXKTB/u','user','defaultpfp.jpg'),(15,'admin1','admin1@gmail.com','$2b$10$ZYwFY.PTHOl6N8GhQA5.duU7wXudg05sBrdyR3MY0EoHTxd4W0f7.','admin','defaultpfp.jpg'),(16,'moose','moose@gmail.com','$2b$10$NAYErQUuLgq0q.bUbrn4FegrbqttrURWH3ttLGjVWpXuu9kWE0Y92','user','defaultpfp.jpg'),(17,'bardaks324','bardaks@inbox.com','$2b$10$isjNToq3v5B/Ohiupeyjwe7sOghKsfk5Y5BsAvJ4hOJQi24XhqWSu','user','defaultpfp.jpg'),(18,'ilze','ilze@gmail.com','$2b$10$sZw.9W15KjJnLdcMh81FZuXbUVGINYsO3ILl47lPOfHiDUUEyYxMe','user','defaultpfp.jpg'),(19,'pele','pele@gmail.com','$2b$10$taKvZEljEjksURnZBUiigOLp4zqrTHkRYJRaue2wKIMzv2.vfFYIm','user','defaultpfp.jpg');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-13  1:10:34

(ns importer.date-util)

(import '(java.text SimpleDateFormat ParseException))
(import '(java.util Calendar))

(def date-format (SimpleDateFormat. "dd.MM.yyyy"))

(defn parse-date [str-date]
  (if (re-matches #"\d\d?\.\d\d?\.\d\d\d\d" str-date)
	(try
	 (.parse date-format str-date)
	 (catch ParseException _ nil))))

(defn format-date [date]
   (.format date-format date))

(defn start-of-this-year []
  (.parse date-format (str "01.01." (.get (Calendar/getInstance) Calendar/YEAR))))

(defn date-check-template [get-date ok-action error-action]
  (let [date (parse-date (get-date))]
	(if date
	  (do
		(ok-action)
		date)
	  (error-action))))

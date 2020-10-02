# load packages
library(shiny)
library(tidyverse)
library(hrbrthemes)

# load and mutate data
score_data <- read_csv("https://raw.githubusercontent.com/mikemaieli/superbowlsquares/master/superbowlscores.csv")


# build UI
ui <- fluidPage(

    # Application title
    titlePanel("Historical Super Bowl Box Winners"),
    ("The table below shows how often each combination of super bowl boxes win over the past 50 years. **Dashboard is a work in progress developed by Mike Maieli**"),
    br(),
    br(),
    br(),
    plotOutput("heatmap"),
    br(),
    hr(),

    # Sidebar with a slider input for number of bins 

    fluidRow(
      column(6,
             h4("Filter The Data"),
             sliderInput("yearInput",
                         "Year",
                         min = 1960,
                         max = 2020,
                         value = c(1967, 2019),
                         sep = "",
                         ticks = 10),
      ),
      column(6,
             h4("Choose the year"),
             radioButtons("quarterInput", "Quarter",
                          choices = c("All" = "all",
                                      "1st quarter" = "1",
                                      "2nd quarter" = "2",
                                      "3rd quarter" = "3",
                                      "4th quarter" = "4",
                                      "Overtime" = "5"),
                          selected = "all"),
             )
        )
    )


# build server
server <- function(input, output, session) { digit_counts <- reactive({
  if (input$quarterInput == "all") {
    score_data %>%
      mutate(afc_digit = afc_total_score %% 10, nfc_digit = nfc_total_score %% 10) %>%
      select(year, superbowl, quarter, afc_digit, nfc_digit) %>%
      mutate_all(as.character) %>%
      filter(year >= input$yearInput[1],
             year <= input$yearInput[2]) %>% 
      group_by(afc_digit, nfc_digit) %>%
      summarize(occurances = n())
  } else {
    score_data %>%
      mutate(afc_digit = afc_total_score %% 10, nfc_digit = nfc_total_score %% 10) %>%
      select(year, superbowl, quarter, afc_digit, nfc_digit) %>%
      mutate_all(as.character) %>%
      filter(year >= input$yearInput[1],
             year <= input$yearInput[2],
             quarter == input$quarterInput) %>%
      group_by(afc_digit, nfc_digit) %>%
      summarize(occurances = n())
  }})

# build output
output$heatmap <- renderPlot({
  ggplot(digit_counts(), aes( x = afc_digit,
                              y = nfc_digit)) +
    geom_tile(aes(fill = occurances), color = "black") +
    geom_text(aes(label = scales::percent((occurances/sum(digit_counts()$occurances)))),
              color = "white",
              size = 6,
              fontface = "bold") +
    scale_fill_gradient(low = "cadetblue", high = "darkslategray", na.value = "white") +
    scale_x_discrete(position = "top",
                     limits = c("0","1","2","3","4","5","6","7","8","9")) +
    scale_y_discrete(limits = rev(c("0","1","2","3","4","5","6","7","8","9"))) +
    labs(x = "AFC",
         y = "NFC") +
    theme_minimal() +
    theme(panel.grid.major = element_blank(),
          legend.position = "none",
          axis.text = element_text(size = 16),
          axis.title.y = element_text(margin = margin(t = 0, r = 20, b = 0, l = 0),
                                      size = 16,
                                      face = "bold"),
          axis.title.x = element_text(margin = margin(t = 0, r = 0, b = 0, l = 0),
                                      size = 16,
                                      face = "bold")) +
    geom_vline(xintercept = c(.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5,8.5,9.5,10.5), color = "black", size = .3) +
    geom_hline(yintercept = c(.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5,8.5,9.5,10.5), color = "black", size = .3)
})}

# create app
shinyApp(ui = ui, server = server)
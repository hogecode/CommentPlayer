package dto

type VideoListResponse struct {
	Data []Video `json:"data"`

	Pagination Pagination `json:"pagination"`
}
